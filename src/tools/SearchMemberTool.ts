import type { HolaspiritClient } from '../config/holaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse } from './common.ts';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Klasse zur Behandlung der 'holaspirit_search_member' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class SearchMemberTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_search_member';
    toolDescription = 'Search for a member by email';
    inputSchema = schemas.SearchMemberRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_search_member' Tool-Anfrage.
     * Sucht nach einem Mitglied anhand der E-Mail-Adresse durch Iterieren über paginierte Ergebnisse.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn das Mitglied nicht gefunden wird oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);
        const targetEmail = args.email.toLowerCase();

        for (let page = 1; page <= 100; page++) {
            const { data: apiResponse } = await this.holaClient.client.GET(
                '/api/organizations/{organization_id}/members',
                {
                    params: {
                        path: { organization_id: this.holaClient.organizationId },
                        query: { page, count: 100 },
                    },
                },
            );

            if (!apiResponse || !Array.isArray(apiResponse.data)) break;

            const found = apiResponse.data.find(
                (m: any) => typeof m === 'object' && m !== null && m.email?.toLowerCase() === targetEmail,
            );

            if (found) {
                const parsed = schemas.SearchMemberResponseSchema.parse(found);
                return formatToolResponse(parsed);
            }

            const pag = (apiResponse as any).pagination;
            if (!pag || !pag.pagesCount || pag.currentPage >= pag.pagesCount) break;
        }

        return {
            content: [],
        };
    }
}
