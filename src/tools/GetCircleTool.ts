import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse } from './common.ts';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_get_circle' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class GetCircleTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName: string = 'holaspirit_get_circle';
    toolDescription = 'Get details of a specific circle';
    inputSchema = schemas.GetCircleRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_get_circle' Tool-Anfrage.
     * Ruft die Details eines spezifischen Circles ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn der Circle nicht gefunden wird oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/circles/{circle_id}',
            {
                params: {
                    path: {
                        organization_id: this.holaClient.organizationId,
                        circle_id: args.circleId,
                    },
                },
            },
        );

        if (apiResponse?.data == null) {
            throw new Error('Circle not found or invalid response format');
        }

        const parsed = schemas.GetCircleResponseSchema.parse({
            ...apiResponse.data,
            roles: undefined,
            linked: {
                roles: (apiResponse as any)?.linked?.roles,
            },
        });

        return formatToolResponse(parsed);
    }
}
