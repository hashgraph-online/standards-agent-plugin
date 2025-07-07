import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} from 'vitest';
import { HederaAgentKit, ServerSigner } from 'hedera-agent-kit';
import { Logger } from '@hashgraphonline/standards-sdk';
import { OpenConvAIPlugin } from '../../src';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive tests for all 11 HCS10 tools
 */
describe('HCS10 Tools Integration Tests', () => {
  let agentKit: HederaAgentKit;
  let tools: Record<string, any> = {};
  let logger: Logger;
  let testAccountId: string;

  beforeAll(async () => {
    const accountId = process.env.HEDERA_ACCOUNT_ID!;
    const privateKey = process.env.HEDERA_PRIVATE_KEY!;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    if (!accountId || !privateKey) {
      throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
    }

    testAccountId = accountId;
    logger = new Logger({ module: 'HCS10-Tools-Test' });

    // Create HederaAgentKit with OpenConvAI plugin
    const signer = new ServerSigner(accountId, privateKey, 'testnet');
    const plugin = new OpenConvAIPlugin(accountId, privateKey);

    agentKit = new HederaAgentKit(signer, {
      appConfig: { openAIApiKey },
      plugins: [plugin]
    });
    agentKit.operationalMode = 'autonomous';

    await agentKit.initialize();

    // Get all tools and organize by name
    const allTools = agentKit.getAggregatedLangChainTools();
    allTools.forEach(tool => {
      tools[tool.name] = tool;
    });

    logger.info(`Loaded ${Object.keys(tools).length} tools`);
  }, 60000);

  afterAll(() => {
    logger.info('HCS10 Tools tests completed');
  });

  describe('Query Tools', () => {
    test('find_registrations - Search for agents', async () => {
      expect(tools.find_registrations).toBeDefined();
      
      const result = await tools.find_registrations.invoke({
        accountId: testAccountId
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      if (result.includes('Found')) {
        expect(result).toMatch(/Found \d+ registration/);
      } else {
        expect(result).toContain('No registrations found');
      }
    });

    test('retrieve_profile - Get agent profile', async () => {
      expect(tools.retrieve_profile).toBeDefined();
      
      const result = await tools.retrieve_profile.invoke({
        accountId: testAccountId
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      if (result.includes('Profile for')) {
        expect(result).toContain('Name:');
        expect(result).toContain('Bio:');
        expect(result).toContain('Type:');
      } else {
        expect(result).toContain('Failed to retrieve profile');
      }
    });

    test('list_connections - List active connections', async () => {
      expect(tools.list_connections).toBeDefined();
      
      const result = await tools.list_connections.invoke({
        includeDetails: true,
        showPending: true
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      if (result.includes('Active Connections')) {
        expect(result).toMatch(/Active Connections \(\d+\)/);
      } else {
        expect(result).toContain('no active connections');
      }
    });

    test('list_unapproved_connection_requests - List pending requests', async () => {
      expect(tools.list_unapproved_connection_requests).toBeDefined();
      
      const result = await tools.list_unapproved_connection_requests.invoke({});

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      // Tool may fail if no agent is active
      if (result.includes('error')) {
        expect(result).toContain('Cannot list connection requests');
      } else {
        expect(result).toMatch(/Found \d+ unapproved connection request|No unapproved connection requests found/);
      }
    });

    test('check_messages - Check messages on a connection', async () => {
      expect(tools.check_messages).toBeDefined();
      
      // This will fail if no connections exist, which is expected
      try {
        const result = await tools.check_messages.invoke({
          targetIdentifier: 'test-connection',
          fetchLatest: true,
          lastMessagesCount: 5
        });

        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        expect(errorMessage).toContain('Could not find an active connection');
      }
    });
  });

  describe('Transaction Tools', () => {
    test('register_agent - Tool exists and has correct schema', async () => {
      expect(tools.register_agent).toBeDefined();
      
      // Test schema validation
      const schema = tools.register_agent.schema;
      expect(schema).toBeDefined();
      
      // Validate required fields
      const parsed = schema.parse({
        name: 'Test Agent',
        metaOptions: {}
      });
      
      expect(parsed.name).toBe('Test Agent');
    });

    test('initiate_connection - Tool exists and validates inputs', async () => {
      expect(tools.initiate_connection).toBeDefined();
      
      // Test schema validation
      const schema = tools.initiate_connection.schema;
      expect(schema).toBeDefined();
      
      // Should fail without required targetAccountId
      expect(() => {
        schema.parse({ metaOptions: {} });
      }).toThrow();
      
      // Should pass with required field
      const parsed = schema.parse({
        targetAccountId: '0.0.12345',
        metaOptions: {}
      });
      
      expect(parsed.targetAccountId).toBe('0.0.12345');
    });

    test('accept_connection_request - Tool exists', async () => {
      expect(tools.accept_connection_request).toBeDefined();
      
      const schema = tools.accept_connection_request.schema;
      expect(schema).toBeDefined();
      
      // Validate schema
      const parsed = schema.parse({
        requestKey: 'test-key',
        metaOptions: {}
      });
      
      expect(parsed.requestKey).toBe('test-key');
    });

    test('send_message_to_connection - Tool exists', async () => {
      expect(tools.send_message_to_connection).toBeDefined();
      
      const schema = tools.send_message_to_connection.schema;
      expect(schema).toBeDefined();
      
      // Validate schema
      const parsed = schema.parse({
        targetIdentifier: '0.0.12345',
        message: 'Hello, World!',
        metaOptions: {}
      });
      
      expect(parsed.targetIdentifier).toBe('0.0.12345');
      expect(parsed.message).toBe('Hello, World!');
    });

    test('monitor_connections - Tool exists and validates schema', async () => {
      expect(tools.monitor_connections).toBeDefined();
      
      const schema = tools.monitor_connections.schema;
      expect(schema).toBeDefined();
      
      // Test with minimal input
      const parsed = schema.parse({
        metaOptions: {}
      });
      
      // Check that fields are optional
      expect(parsed.acceptAll).toBeUndefined();
      expect(parsed.monitorDurationSeconds).toBeUndefined();
      
      // Test with values
      const withValues = schema.parse({
        acceptAll: true,
        monitorDurationSeconds: 60,
        metaOptions: {}
      });
      
      expect(withValues.acceptAll).toBe(true);
      expect(withValues.monitorDurationSeconds).toBe(60);
    });

    test('manage_connection_requests - Tool exists with actions', async () => {
      expect(tools.manage_connection_requests).toBeDefined();
      
      const schema = tools.manage_connection_requests.schema;
      expect(schema).toBeDefined();
      
      // Test list action
      const listParsed = schema.parse({
        action: 'list',
        metaOptions: {}
      });
      
      expect(listParsed.action).toBe('list');
      
      // Test view action
      const viewParsed = schema.parse({
        action: 'view',
        requestKey: 'test-key',
        metaOptions: {}
      });
      
      expect(viewParsed.action).toBe('view');
      expect(viewParsed.requestKey).toBe('test-key');
    });
  });

  describe('Tool Namespaces and Metadata', () => {
    test('All HCS10 tools have correct namespace', () => {
      const hcs10Tools = Object.values(tools).filter(
        (tool: any) => tool.namespace === 'hcs10'
      );
      
      expect(hcs10Tools.length).toBe(11);
      
      hcs10Tools.forEach((tool: any) => {
        expect(tool.namespace).toBe('hcs10');
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
      });
    });

    test('All tools have proper descriptions', () => {
      const hcs10ToolNames = [
        'register_agent',
        'find_registrations',
        'retrieve_profile',
        'list_connections',
        'initiate_connection',
        'send_message_to_connection',
        'check_messages',
        'monitor_connections',
        'manage_connection_requests',
        'accept_connection_request',
        'list_unapproved_connection_requests',
      ];

      hcs10ToolNames.forEach(name => {
        const tool = tools[name];
        expect(tool).toBeDefined();
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Plugin Integration', () => {
    test('Plugin correctly extends HederaAgentKit', () => {
      // Verify the kit has all expected methods
      expect(agentKit.getAggregatedLangChainTools).toBeDefined();
      expect(agentKit.operationalMode).toBe('autonomous');
      
      // Verify plugin tools are integrated
      const allTools = agentKit.getAggregatedLangChainTools();
      const hcs10Tools = allTools.filter(t => t.namespace === 'hcs10');
      
      expect(hcs10Tools.length).toBe(11);
    });

    test('Tools use correct builder pattern', async () => {
      // Get a transaction tool
      const registerTool = tools.register_agent;
      expect(registerTool).toBeDefined();
      
      // The tool should have the correct structure
      expect(registerTool._call).toBeDefined();
      expect(registerTool.schema).toBeDefined();
      expect(registerTool.name).toBe('register_agent');
      expect(registerTool.namespace).toBe('hcs10');
    });
  });

  describe('Error Handling', () => {
    test('Tools handle invalid inputs gracefully', async () => {
      // Test with invalid account ID
      try {
        const result = await tools.retrieve_profile.invoke({
          accountId: 'invalid-account'
        });
        
        expect(result).toContain('Failed to retrieve profile');
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }
    });

    test('Tools require directExecution mode for multi-transaction operations', async () => {
      // Temporarily switch to returnBytes mode
      agentKit.operationalMode = 'returnBytes';
      
      try {
        const result = await tools.register_agent.invoke({
          name: 'Test Agent',
          metaOptions: {}
        });
        
        // Check if error is in result or thrown
        if (typeof result === 'string' && result.includes('error')) {
          expect(result).toContain('requires multiple transactions');
        } else {
          // Should not reach here without error
          expect(true).toBe(false);
        }
      } catch (error: any) {
        expect(error.message).toContain('requires multiple transactions');
      } finally {
        // Restore mode
        agentKit.operationalMode = 'autonomous';
      }
    });
  });
});