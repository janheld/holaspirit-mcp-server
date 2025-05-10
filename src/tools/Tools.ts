import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolModule } from './ToolBase.ts';

import * as listTasks from './ListTasksTool.ts';
import * as listMetrics from './ListMetricsTool.ts';
import * as listCircles from './ListCirclesTool.ts';
import * as getCircle from './GetCircleTool.ts';
import * as listRoles from './ListRolesTool.ts';
import * as getRole from './GetRoleTool.ts';
import * as listDomains from './ListDomainsTool.ts';
import * as listPolicies from './ListPoliciesTool.ts';
import * as listMeetings from './ListMeetingsTool.ts';
import * as getMeeting from './GetMeetingTool.ts';
import * as getMemberFeed from './GetMemberFeedTool.ts';
import * as getTensions from './GetTensionsTool.ts';
import * as searchMember from './SearchMemberTool.ts';

/**
 * Klasse zur Verwaltung der Tools.
 * Diese Klasse kapselt die Initialisierung und Verwaltung der Tool-Handler und -Definitionen.
 */
export class Tools {
    private tools: ToolModule[] = [];
    private toolHandlers: Record<string, (request: z.infer<typeof CallToolRequestSchema>) => Promise<any>> = {};
    private toolDefinitions: { name: string; description: string; inputSchema: any }[] = [];

    /**
     * Initialisiert die Tools mit dem gegebenen HolaspiritClient.
     * @param holaClient Der HolaspiritClient, der an alle Tools übergeben wird.
     */
    constructor(holaClient: any) {
        this.tools = [
            new listTasks.ListTasksTool(holaClient),
            new listMetrics.ListMetricsTool(holaClient),
            new listCircles.ListCirclesTool(holaClient),
            new getCircle.GetCircleTool(holaClient),
            new listRoles.ListRolesTool(holaClient),
            new getRole.GetRoleTool(holaClient),
            new listDomains.ListDomainsTool(holaClient),
            new listPolicies.ListPoliciesTool(holaClient),
            new listMeetings.ListMeetingsTool(holaClient),
            new getMeeting.GetMeetingTool(holaClient),
            new getMemberFeed.GetMemberFeedTool(holaClient),
            new getTensions.GetTensionsTool(holaClient),
            new searchMember.SearchMemberTool(holaClient),
        ];

        // Erstelle die Tool-Handler-Map
        this.tools.forEach(tool => {
            this.toolHandlers[tool.toolName] = tool.execute.bind(tool);
        });

        // Erstelle die Tool-Definitionen
        this.toolDefinitions = this.tools.map(tool => ({
            name: tool.toolName,
            description: tool.toolDescription,
            inputSchema: zodToJsonSchema(tool.inputSchema),
        }));
    }

    /**
     * Gibt einen bestimmten Tool-Handler anhand seines Namens zurück.
     * @param name Der Name des Tools.
     * @returns Der Tool-Handler oder `undefined`, wenn kein Tool mit diesem Namen existiert.
     */
    getHandler(name: string): ((request: z.infer<typeof CallToolRequestSchema>) => Promise<any>) | undefined {
        return this.toolHandlers[name];
    }

    /**
     * Gibt die Tool-Definitionen zurück.
     * @returns Eine Liste von Tool-Definitionen.
     */
    getDefinitions(): { name: string; description: string; inputSchema: any }[] {
        return this.toolDefinitions;
    }
}