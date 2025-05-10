import type { HolaspiritClient } from '../config/holaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse } from './common.ts'; // Import der gemeinsamen Hilfsfunktion
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_get_member_feed' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class GetMemberFeedTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_get_member_feed';
    toolDescription = 'Get member feed';
    inputSchema = schemas.GetMemberFeedRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_get_member_feed' Tool-Anfrage.
     * Ruft den Feed eines spezifischen Mitglieds ab und gibt ihn zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn der Member Feed nicht gefunden wird oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/members/{member_id}/feed',
            {
                params: {
                    path: {
                        organization_id: this.holaClient.organizationId,
                        member_id: args.memberId,
                    },
                    query: {
                        activityType: args.activityType,
                        event: args.event,
                        minTime: args.minTime,
                        maxTime: args.maxTime,
                        count: args.count,
                    },
                },
            },
        );

        if (apiResponse?.data == null) {
            throw new Error('Member feed not found or invalid response format');
        }

        const parsed = schemas.GetMemberFeedResponseSchema.parse(apiResponse.data);

        return formatToolResponse(parsed);
    }
}
