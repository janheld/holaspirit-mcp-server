import type { HolaspiritClient } from '../config/HolaspiritClient.ts';
import * as schemas from '../schemas.ts';
import { formatToolResponse } from './common.ts';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

/**
 * Typ-Definition für das Ergebnis der Spannungsabfrage pro Meeting.
 */
type MeetingTensionResult = {
    meetingId: string;
    apiResponse?: any | null;
    error?: Error;
};

/**
 * Klasse zur Behandlung der 'holaspirit_get_tensions' Tool-Anfrage.
 * Diese Klasse kapselt die Logik und den HolaspiritClient.
 */
export class GetTensionsTool implements ToolModule {
    private holaClient: HolaspiritClient;

    /**
     * Metadaten des Tools
     */
    toolName = 'holaspirit_get_tensions';
    toolDescription = 'Get tensions for a meeting or meetings';
    inputSchema = schemas.GetTensionsRequestSchema;

    /**
     * Konstruktor zur Initialisierung des HolaspiritClients.
     * @param holaClient Der HolaspiritClient, der für API-Aufrufe verwendet wird.
     */
    constructor(holaClient: HolaspiritClient) {
        this.holaClient = holaClient;
    }

    /**
     * Behandelt die 'holaspirit_get_tensions' Tool-Anfrage.
     * Ruft Spannungen für eine Liste von Meeting-IDs ab und gibt sie zurück.
     * @param request Der eingehende CallToolRequestSchema Request.
     * @returns Ein Promise, das eine JSON-Antwort im MCP-Format liefert.
     * @throws {Error} Wenn keine Spannungen gefunden werden oder die API-Antwort ungültig ist.
     */
    async execute(request: z.infer<typeof CallToolRequestSchema>) {
        const args = this.inputSchema.parse(request.params.arguments);

        const results = await Promise.all(
            args.meetingIds.map(async (meetingId: string) => {
                try {
                    const { data: apiResponse } = await this.holaClient.client.GET(
                        '/api/organizations/{organization_id}/tensions',
                        {
                            params: {
                                path: { organization_id: this.holaClient.organizationId },
                                query: { meeting: meetingId },
                            },
                        },
                    );
                    return { meetingId, apiResponse };
                } catch (err) {
                    return {
                        meetingId,
                        error: err instanceof Error ? err : new Error(String(err)),
                    };
                }
            }),
        );

        const successes = results.filter(
            (r): r is { meetingId: string; apiResponse: any } =>
                !r.error && typeof r.apiResponse !== 'undefined' && r.apiResponse !== null,
        );
        const failures = results
            .filter((r) => Boolean(r.error))
            .map(({ meetingId, error }) => ({
                meetingId,
                error: error ? error.message : undefined,
            }));

        if (successes.length === 0 && failures.length > 0) {
            throw new Error('No tensions found or all requests failed');
        }

        const tensions = successes.flatMap(({ meetingId, apiResponse }) => {
            if (!apiResponse || typeof apiResponse !== 'object' || !('data' in apiResponse) || !Array.isArray(apiResponse.data)) {
                return [];
            }
            return apiResponse.data.map((tension: any) => ({
                ...tension,
                meetingId,
            }));
        });

        const response = schemas.GetTensionsResponseSchema.parse({
            tensions,
            failures,
        });

        return formatToolResponse(response);
    }
}
