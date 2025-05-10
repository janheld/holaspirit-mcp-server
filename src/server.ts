import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Tools } from './tools/Tools.ts';
import { ListToolsHandler } from './handlers/ListToolsHandler.ts';
import { CallToolHandler } from './handlers/CallToolHandler.ts';

/**
 * Creates and configures the Holaspirit MCP server instance.
 * This function separates server initialization from the main entry point.
 * @param tools - The Tools instance that manages tool handlers and definitions.
 * @returns The configured MCP Server instance.
 */
export function createMcpServer(tools: Tools) {
    const server = new Server(
        {
            name: 'holaspirit-mcp-server',
            version: '0.0.1', // Keep version consistent
        },
        {
            capabilities: {
                tools: {}, // Indicates the server supports tools
            },
        },
    );

    // Initialisiere die Handler-Klassen einmalig
    const listToolsHandler = new ListToolsHandler(tools);
    const callToolHandler = new CallToolHandler(tools);

    // Register request handlers for ListTools and CallTool
    server.setRequestHandler(ListToolsRequestSchema, (request) => listToolsHandler.handle(request));
    server.setRequestHandler(CallToolRequestSchema, (request) => callToolHandler.handle(request));

    return server;
}