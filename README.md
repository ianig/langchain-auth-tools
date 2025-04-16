# 🔐 langchain-auth-tools

**A simple authorization adapter for LangChain tools**, based on JWT scopes/claims.

Easily restrict access to tools by defining required scopes. Ideal for multi-user LLM environments with permissioned actions.

---

## 📦 Installation

```bash
npm install langchain-auth-tools jose
```

## Uso

```ts
import { PermissionedTool, AuthToolAdapter } from 'langchain-auth-tools';

// Define your tools with the required scopes
const calendar = new PermissionedTool({
  name: 'calendar',
  description: 'Manages calendar events',
  func: async (input: string) => `Event created: ${input}`,
  requiredScopes: ['use_calendar'],
});

// Register all tools
const allTools = [calendar /*, ...other tools */];

// Create the adapter with your JWT secret
const adapter = new AuthToolAdapter(allTools, { jwtSecret: 'YOUR_SECRET' });

// Get the allowed tools for a user from their JWT
const allowed = await adapter.getAllowedToolsFromJwt(userJwt);

```

### Expected JWT Payload

```ts
interface JwtPayload {
  sub: string;
  scopes?: string[];
  scope?: string;  // space-separated string (fallback)
  [key: string]: any;
}
```

## 🙋 How to Contribute

Contributions are welcome! Check out the [contributing guide](./CONTRIBUTING.md) to get started.
