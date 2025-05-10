import type { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import { Tools } from '../tools/Tools.ts';

/**
 * Klasse zur Behandlung der CallTool-Anfrage.
 * Diese Klasse kapselt die Logik für das Dispatching der Anfrage an den entsprechenden Tool-Handler.
 */
export class CallToolHandler {
    private tools: Tools;

    /**
     * Konstruktor zur Initialisierung des Handlers.
     * @param tools - The Tools instance that manages tool handlers and definitions.
     */
    constructor(tools: Tools) {
        this.tools = tools;
    }

    /**
     * Behandelt die CallTool-Anfrage, indem sie an den entsprechenden Tool-Handler weitergeleitet wird.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise mit dem Ergebnis des Tool-Handlers.
     * @throws {Error} Wenn das Tool nicht gefunden wird oder ein Fehler auftritt.
     */
    async handle(request: z.infer<typeof CallToolRequestSchema>): Promise<any> {
        try {
            if (!request.params) {
                throw new Error('Params are required for CallToolRequest');
            }

            const toolName = request.params.name;
            const handler = this.tools.getHandler(toolName);

            if (!handler) {
                throw new Error(`Unknown tool: ${toolName}`);
            }

            // Call the specific tool handler
            return await handler(request);
        } catch (error) {
            console.error(`Error handling tool call for '${request.params?.name}':`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            // Re-throw the error to allow the MCP server's transport layer to handle the error response format.
            throw new Error(errorMessage);
        }
    }
}
