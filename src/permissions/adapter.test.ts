// auth-adapter.test.ts
import { AuthToolAdapter } from './adapter';
import { PermissionedTool } from './permissioned-tool';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const SECRET = 'test-secret';

describe('AuthToolAdapter', () => {
  const tools = [
    new PermissionedTool({
      name: 'tool1',
      description: 'desc1',
      func: async () => 'ok',
      schema: z.object({}),
      requiredScopes: ['read'],
    }),
    new PermissionedTool({
      name: 'tool2',
      description: 'desc2',
      func: async () => 'ok',
      schema: z.object({}),
      requiredScopes: ['write'],
    }),
  ];

  const adapter = new AuthToolAdapter(tools, { jwtSecret: SECRET });

  it('should return allowed tools based on token scopes', async () => {
    const token = jwt.sign({ scopes: ['read'] }, SECRET);
    const allowed = await adapter.getAllowedToolsFromJwt(token);

    expect(allowed.length).toBe(1);
    expect(allowed[0].name).toBe('tool1');
  });

  it('should throw error for invalid token', async () => {
    const badToken = 'abc.def.ghi';
    await expect(adapter.getAllowedToolsFromJwt(badToken)).rejects.toThrow();
  });

  it('should return tools based on manual scopes', () => {
    const allowed = adapter.getAllowedToolsFromScopes(['read', 'write']);
    expect(allowed.length).toBe(2);
  });
});
