import jwt, { JwtPayload } from 'jsonwebtoken';
import { PermissionedTool } from './permissioned-tool';

/**
 * Payload esperado do JWT
 */
export interface JwtPayloadSchema extends JwtPayload {
  sub: string;
  scopes?: string[];
  scope?: string;
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
  public toolsByName: Record<string, PermissionedTool>;

  constructor(tools: PermissionedTool[], options: AuthToolAdapterOptions) {
    this.tools = tools;
    this.skipJwt = options.skipJwt ?? false;
    if (!this.skipJwt) {
      if (!options.jwtSecret) {
        throw new Error('jwtSecret é obrigatório quando skipJwt=false');
      }
      this.secret = options.jwtSecret;
    }
    // ✅ Constrói o objeto { [tool.name]: tool }
    this.toolsByName = Object.fromEntries(
        tools.map(tool => [tool.name, tool])
        );
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

  public getToolsByNameObjc(){
    return this.toolsByName
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
