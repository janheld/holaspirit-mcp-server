import { z, ZodSchema } from 'zod';

/**
 * Formats the data into the standard MCP server response content type.
 * @param data The data to be returned as JSON.
 * @returns A JSON object conforming to the MCP content structure.
 */
export function formatToolResponse(data: any): any {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
}

/**
 * Parses a paginated Holaspirit API response and validates it against Zod schemas.
 * @param apiResponse The raw API response object containing 'data' and 'pagination'.
 * @param itemSchema A Zod schema for the array of items within the 'data' field.
 * @returns An object with 'pagination' and 'items' conforming to ListBaseResponseSchema.
 * @throws {Error} If the API response data is null or in an invalid format.
 */
export function parsePaginatedHolaspiritResponse<TItem>(
    apiResponse: { data?: TItem[]; pagination?: { currentPage: number; pagesCount: number } | null },
    itemSchema: ZodSchema<TItem[]>, // Zod schema for the 'data' array part
) {
    if (apiResponse?.data == null) {
        throw new Error('Response data is null or invalid format');
    }
    const items = itemSchema.parse(apiResponse.data);
    return {
        pagination: apiResponse.pagination || { currentPage: 1, pagesCount: 1 },
        items: items,
    };
}

/**
 * Parses a single-item Holaspirit API response and validates it against a Zod schema.
 * @param apiResponse The raw API response object containing a single 'data' item.
 * @param dataSchema A Zod schema for the single item within the 'data' field.
 * @returns The parsed data item.
 * @throws {Error} If the API response data is null or in an invalid format.
 */
export function parseSingleHolaspiritResponse<TData>(
    apiResponse: { data?: TData | null },
    dataSchema: ZodSchema<TData>, // Zod schema for the 'data' part
) {
    if (apiResponse?.data == null) {
        throw new Error('Response data is null or invalid format');
    }
    return dataSchema.parse(apiResponse.data);
}
