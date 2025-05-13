import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse, parseSingleHolaspiritResponse } from './common.ts'; // Import der gemeinsamen Hilfsfunktionen
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_get_role' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class GetRoleTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_get_role';
    toolDescription = 'Get details of a specific role';
    inputSchema = schemas.GetRoleRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_get_role' Tool-Anfrage.
     * Ruft die Details einer spezifischen Rolle ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn die Rolle nicht gefunden wird oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const { data: apiResponse } = await this.holaClient.client.GET(
            '/api/organizations/{organization_id}/roles/{role_id}',
            {
                params: {
                    path: {
                        organization_id: this.holaClient.organizationId,
                        role_id: args.roleId,
                    },
                },
            },
        );

        const parsed = parseSingleHolaspiritResponse(
            apiResponse as any,
            schemas.GetRoleResponseSchema,
        );

        return formatToolResponse(parsed);
    }
}
