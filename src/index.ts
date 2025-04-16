import { StructuredTool } from 'langchain/tools';
import { jwtVerify, JWTVerifyResult, JWTPayload } from 'jose';

/**
 * Payload esperado do JWT
 */
export interface JwtPayloadSchema extends JWTPayload {
  sub: string;
  scopes?: string[];
  scope?: string;
}

/**
 * Extensão de StructuredTool do LangChain com escopos obrigatórios
 */
export class PermissionedTool extends StructuredTool {
  public requiredScopes: string[];

  constructor(opts: {
    name: string;
    description: string;
    func: (input: any) => Promise<any>;
    schema?: any;
    requiredScopes: string[];
  }) {
    super({
      name: opts.name,
      description: opts.description,
      func: opts.func,
      schema: opts.schema,
    });
    this.requiredScopes = opts.requiredScopes;
  }
}

/**
 * Opções do AuthToolAdapter
 */
export interface AuthToolAdapterOptions {
  jwtSecret?: string;
  skipJwt?: boolean;
}

export class AuthToolAdapter {
  private tools: PermissionedTool[];
  private secret?: Uint8Array;
  private skipJwt: boolean;

  constructor(tools: PermissionedTool[], options: AuthToolAdapterOptions) {
    this.tools = tools;
    this.skipJwt = options.skipJwt ?? false;
    if (!this.skipJwt) {
      if (!options.jwtSecret) {
        throw new Error('jwtSecret é obrigatório quando skipJwt=false');
      }
      this.secret = new TextEncoder().encode(options.jwtSecret);
    }
  }

  public async getAllowedToolsFromJwt(token: string): Promise<PermissionedTool[]> {
    if (this.skipJwt) {
      throw new Error('JWT validation está desabilitada (skipJwt=true)');
    }
    const { payload }: JWTVerifyResult = await jwtVerify(
      token,
      this.secret!,
      { algorithms: ['HS256'] }
    );
    return this.filterByPayload(payload as JwtPayloadSchema);
  }

  public getAllowedToolsFromScopes(scopes: string[]): PermissionedTool[] {
    return this.tools.filter(tool =>
      tool.requiredScopes.every(rs => scopes.includes(rs))
    );
  }

  private filterByPayload(payload: JwtPayloadSchema): PermissionedTool[] {
    let scopes: string[] = [];
    if (Array.isArray(payload.scopes)) {
      scopes = payload.scopes;
    } else if (typeof payload.scope === 'string') {
      scopes = payload.scope.split(/\s+/);
    } else {
      throw new Error('Payload JWT não contém scopes ou scope');
    }
    return this.getAllowedToolsFromScopes(scopes);
  }
}