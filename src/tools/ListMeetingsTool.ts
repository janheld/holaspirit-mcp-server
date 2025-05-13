import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse, parsePaginatedHolaspiritResponse } from './common.ts';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_list_meetings' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class ListMeetingsTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_list_meetings';
    toolDescription = 'List all meetings in the organization';
    inputSchema = schemas.ListMeetingsRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_list_meetings' Tool-Anfrage.
     * Ruft eine paginierte Liste von Meetings ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn Meetings nicht gefunden werden oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/meetings',
            {
                params: {
                    path: { organization_id: this.holaClient.organizationId },
                    query: { page: args.page, count: args.count },
                },
            },
        );

        const parsed = parsePaginatedHolaspiritResponse(
            apiResponse as any,
            schemas.ListMeetingsResponseSchema.shape.items,
        );

        const finalParsed = schemas.ListMeetingsResponseSchema.parse(parsed);

        return formatToolResponse(finalParsed);
    }
}
