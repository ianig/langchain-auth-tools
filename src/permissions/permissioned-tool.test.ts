// permissioned-tool.test.ts
import { z } from 'zod';
import { PermissionedTool } from './permissioned-tool';

describe('PermissionedTool', () => {
  it('should call func correctly', async () => {
    const mockFunc = jest.fn().mockResolvedValue('ok');

    const tool = new PermissionedTool({
      name: 'test',
      description: 'test tool',
      func: mockFunc,
      schema: z.object({ input: z.string() }),
      requiredScopes: ['read'],
    });

    const result = await tool.invoke({ input: 'hello' });

    expect(mockFunc).toHaveBeenCalledWith({ input: 'hello' });
    expect(result).toBe('ok');
  });

  it('should expose name and description', () => {
    const tool = new PermissionedTool({
      name: 'toolName',
      description: 'desc',
      func: async () => 'test',
      schema: z.object({}),
      requiredScopes: [],
    });

    expect(tool.name).toBe('toolName');
    expect(tool.description).toBe('desc');
  });
});
