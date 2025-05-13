import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse, parsePaginatedHolaspiritResponse } from './common.ts';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_list_circles' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class ListCirclesTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_list_circles';
    toolDescription = 'List all circles in the organization';
    inputSchema = schemas.ListCirclesRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_list_circles' Tool-Anfrage.
     * Ruft eine paginierte Liste von Circles ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn Circles nicht gefunden werden oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/circles',
            {
                params: {
                    path: { organization_id: this.holaClient.organizationId },
                    query: {
                        page: args.page,
                        count: args.count,
                        member: args.member,
                        circle: args.circle,
                    },
                },
            },
        );

        const parsed = parsePaginatedHolaspiritResponse(
            apiResponse as any,
            schemas.ListCirclesResponseSchema.shape.items,
        );

        const finalParsed = schemas.ListCirclesResponseSchema.parse(parsed);

        return formatToolResponse(finalParsed);
    }
}
