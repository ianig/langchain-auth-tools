import { StructuredTool } from 'langchain/tools';
import { z, ZodObject, ZodRawShape } from 'zod';

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
