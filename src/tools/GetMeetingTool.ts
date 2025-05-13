import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse } from './common.ts'; // Import der gemeinsamen Hilfsfunktion
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_get_meeting' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class GetMeetingTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_get_meeting';
    toolDescription = 'Get details of a specific meeting';
    inputSchema = schemas.GetMeetingRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_get_meeting' Tool-Anfrage.
     * Ruft die Details eines spezifischen Meetings ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn das Meeting nicht gefunden wird oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/meetings/{meeting_id}',
            {
                params: {
                    path: {
                        organization_id: this.holaClient.organizationId,
                        meeting_id: args.meetingId,
                    },
                },
            },
        );

        if (apiResponse?.data == null) {
            throw new Error('Meeting not found or invalid response format');
        }

        const parsed = schemas.GetMeetingResponseSchema.parse({
            ...apiResponse.data,
            tensions: undefined,
            linked: {
                tensions: (apiResponse as any)?.linked?.tensions,
            },
        });

        return formatToolResponse(parsed);
    }
}
