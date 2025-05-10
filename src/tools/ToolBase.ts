import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export interface ToolModule {
    toolName: string;
    toolDescription: string;
    inputSchema: z.ZodSchema<any>;
    execute: (request: z.infer<typeof CallToolRequestSchema>) => Promise<any>;
}
