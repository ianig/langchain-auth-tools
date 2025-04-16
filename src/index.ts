import { StructuredTool } from 'langchain/tools';
import { z, ZodObject, ZodRawShape } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * Payload esperado do JWT
 */
export interface JwtPayloadSchema extends JwtPayload {
  sub: string;
  scopes?: string[];
  scope?: string;
}

/**
 * Extensão de StructuredTool do LangChain com escopos obrigatórios
 */
export class PermissionedTool extends StructuredTool<ZodObject<ZodRawShape>> {
  public requiredScopes: string[];
  name: string;
  description: string;
  schema: ZodObject<ZodRawShape>;
  private func: (input: any) => Promise<any>;

  constructor(opts: {
    name: string;
    description: string;
    func: (input: any) => Promise<any>;
    schema?: ZodObject<ZodRawShape>;
    requiredScopes: string[];
  }) {
    super();
    this.name = opts.name;
    this.description = opts.description;
    this.schema = opts.schema ?? z.object({});
    this.func = opts.func;
    this.requiredScopes = opts.requiredScopes;
  }

  protected async _call(input: any): Promise<any> {
    return this.func(input);
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
  private secret?: string;
  private skipJwt: boolean;

  constructor(tools: PermissionedTool[], options: AuthToolAdapterOptions) {
    this.tools = tools;
    this.skipJwt = options.skipJwt ?? false;
    if (!this.skipJwt) {
      if (!options.jwtSecret) {
        throw new Error('jwtSecret é obrigatório quando skipJwt=false');
      }
      this.secret = options.jwtSecret;
    }
  }

  public async getAllowedToolsFromJwt(token: string): Promise<PermissionedTool[]> {
    if (this.skipJwt) {
      throw new Error('JWT validation está desabilitada (skipJwt=true)');
    }

    let payload: JwtPayloadSchema;
    try {
      payload = jwt.verify(token, this.secret!) as JwtPayloadSchema;
    } catch (err) {
      throw new Error('JWT inválido: ' + (err as Error).message);
    }

    return this.filterByPayload(payload);
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
