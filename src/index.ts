#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.ts';
import { createHolaspiritClientFromEnv } from './config/HolaspiritClient.ts';
import { Tools } from './tools/Tools.ts';

/**
 * Main function to run the MCP server.
 * Initializes the server and connects it to the standard I/O transport.
 */
async function runServer() {
    const holaClient = createHolaspiritClientFromEnv();  
    const tools = new Tools(holaClient);
    const server = createMcpServer(tools);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Holaspirit MCP Server running on stdio');
}

// Execute the server and handle any fatal errors
runServer().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
