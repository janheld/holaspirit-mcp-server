import type { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import type { Tools } from '../tools/Tools.ts';

/**
 * Klasse zur Behandlung der ListTools-Anfrage.
 * Diese Klasse kapselt die Logik für das Abrufen der Tool-Definitionen.
 */
export class ListToolsHandler {
    private tools: Tools;

    /**
     * Konstruktor zur Initialisierung des Handlers.
     * @param tools - The Tools instance that manages tool handlers and definitions.
     */
    constructor(tools: Tools) {
        this.tools = tools;
    }

    /**
     * Behandelt die Anfrage und gibt die Tool-Definitionen zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise mit den Tool-Definitionen.
     */
    async handle(request: z.infer<typeof ListToolsRequestSchema>): Promise<any> {
        return {
            tools: this.tools.getDefinitions,
        };
    }
}
