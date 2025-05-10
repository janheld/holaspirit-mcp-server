// Laden der Umgebungsvariablen aus der .env-Datei
// Dies muss ganz am Anfang geschehen, bevor auf process.env zugegriffen wird.
import 'dotenv/config';

import { createHolaspiritClient as createClient } from 'holaspirit-client-typescript-fetch';

export const HOLASPIRIT_API_BASE_URL = 'https://app.holaspirit.com';

// Define a type for the Holaspirit client
export interface HolaspiritClient {
    client: ReturnType<typeof createClient>;
    organizationId: string;
}

export function createHolaspiritClientFromEnv(): HolaspiritClient {
    const apiToken = process.env.HOLASPIRIT_API_TOKEN;
    if (!apiToken) {
        throw new Error('HOLASPIRIT_API_TOKEN environment variable is required');
    }

    const organizationId = process.env.HOLASPIRIT_ORGANIZATION_ID;
    if (!organizationId) {
        throw new Error('HOLASPIRIT_ORGANIZATION_ID environment variable is required');
    }

    return {
        client: createClient(HOLASPIRIT_API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }),
        organizationId,
    };
}