# langchain-auth-tools

Adapter para autorização de ferramentas LangChain baseado em JWT scopes/claims ou escopos diretos.

## Instalação

```bash
npm install langchain-auth-tools jose
```

## Uso

```ts
import { PermissionedTool, AuthToolAdapter } from 'langchain-auth-tools';

// Defina suas ferramentas com os scopes necessários
const calendar = new PermissionedTool({
  name: 'calendar',
  description: 'Gerencia eventos no calendário',
  func: async (input: string) => `Evento criado: ${input}`,
  requiredScopes: ['use_calendar'],
});

// Agrupe todas as tools
const allTools = [calendar /*, ...outras tools */];

// Instancie o adapter
const adapter = new AuthToolAdapter(allTools, { jwtSecret: 'SEU_SECRET' });

// Obtenha ferramentas permitidas a partir de um JWT
const allowed = await adapter.getAllowedToolsFromJwt(userJwt);
```

### Schema esperado do JWT

```ts
interface JwtPayload {
  sub: string;
  scopes?: string[];
  scope?: string; // scopes separados por espaço
  [key: string]: any;
}
```

## API

- `PermissionedTool`: estende `StructuredTool` com `requiredScopes: string[]`
- `AuthToolAdapter`:
  - `getAllowedToolsFromJwt(token: string): Promise<PermissionedTool[]>`
  - `getAllowedToolsFromScopes(scopes: string[]): PermissionedTool[]`

---

## Contribuição

Pull requests são bem-vindos! Abra uma issue para discutir mudanças.