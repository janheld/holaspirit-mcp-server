import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as schemas from '../schemas.ts';
import { formatToolResponse, parsePaginatedHolaspiritResponse } from './common.ts';
import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_list_tasks' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class ListTasksTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_list_tasks';
    toolDescription = 'List all tasks in the organization';
    inputSchema = schemas.ListTasksRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_list_tasks' Tool-Anfrage.
     * Ruft eine paginierte Liste von Aufgaben ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn Aufgaben nicht gefunden werden oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/tasks',
            {
                params: {
                    path: { organization_id: this.holaClient.organizationId },
                    query: { page: args.page, count: args.count },
                },
            },
        );

        const parsed = parsePaginatedHolaspiritResponse(
            apiResponse as any,
            schemas.ListTasksResponseSchema.shape.items,
        );

        const finalParsed = schemas.ListTasksResponseSchema.parse(parsed);

        return formatToolResponse(finalParsed);
    }
}
