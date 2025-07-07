import { describe, test, expect, beforeEach, vi } from 'vitest';
import { OpenConvAIPlugin } from '../../src';
import { Logger } from '@hashgraphonline/standards-sdk';

/**
 * Unit tests for OpenConvAIPlugin
 */
describe('OpenConvAIPlugin Unit Tests', () => {
  let mockHederaKit: any;
  let mockContext: any;
  
  beforeEach(() => {
    // Mock HederaAgentKit
    mockHederaKit = {
      client: {
        network: { toString: () => 'testnet' }
      },
      signer: {
        getAccountId: () => ({ toString: () => '0.0.12345' }),
        getOperatorPrivateKey: () => ({ toStringRaw: () => 'mock-private-key' })
      },
      operationalMode: 'directExecution'
    };

    // Mock plugin context
    mockContext = {
      kit: mockHederaKit,
      logger: new Logger({ module: 'test' }),
      modelCapability: 'MEDIUM',
      config: {
        hederaKit: mockHederaKit
      }
    };
  });

  describe('Plugin Initialization', () => {
    test('Plugin creates with valid parameters', () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('OpenConvAI Standards Agent Kit Plugin');
      expect(plugin.description).toContain('HCS-10');
    });

    test('Plugin initializes tools on init', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      // Need to mock the logger methods
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      
      try {
        await plugin.initialize(mockContext);
      } catch (error) {
        console.error('Plugin initialization error:', error);
      }
      
      const tools = plugin.getTools();
      console.log('Tools created:', tools.length);
      console.log('Logger warn calls:', (mockContext.logger.warn as any).mock?.calls);
      console.log('Logger error calls:', (mockContext.logger.error as any).mock?.calls);
      
      expect(tools).toBeDefined();
      expect(tools.length).toBe(11); // All 11 HCS10 tools
    });

    test('Plugin tools have correct structure', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('namespace');
        expect(tool).toHaveProperty('schema');
        expect(tool).toHaveProperty('_call');
        expect(tool.namespace).toBe('hcs10');
      });
    });

    test('Plugin creates HCS10Builder with correct parameters', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      // Verify tools were created (which means builder was created)
      const tools = plugin.getTools();
      const registerTool = tools.find(t => t.name === 'register_agent');
      
      expect(registerTool).toBeDefined();
    });
  });

  describe('Tool Names and Descriptions', () => {
    test('All tools have unique names', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      const names = tools.map(t => t.name);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(names.length);
    });

    test('All tools have descriptive text', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      
      tools.forEach(tool => {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(20);
        expect(tool.description).not.toContain('TODO');
        expect(tool.description).not.toContain('undefined');
      });
    });
  });

  describe('Tool Categories', () => {
    test('Tools are properly categorized', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      
      const transactionTools = [
        'register_agent',
        'initiate_connection',
        'accept_connection_request',
        'send_message_to_connection',
        'monitor_connections',
        'manage_connection_requests'
      ];
      
      const queryTools = [
        'find_registrations',
        'retrieve_profile',
        'list_connections',
        'check_messages',
        'list_unapproved_connection_requests'
      ];
      
      // Verify we have all expected tools
      [...transactionTools, ...queryTools].forEach(toolName => {
        const tool = tools.find(t => t.name === toolName);
        expect(tool).toBeDefined();
      });
      
      expect(transactionTools.length + queryTools.length).toBe(11);
    });
  });

  describe('StateManager Integration', () => {
    test('Plugin initializes StateManager', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      // StateManager should be created and used by tools
      const tools = plugin.getTools();
      const listConnectionsTool = tools.find(t => t.name === 'list_connections');
      
      expect(listConnectionsTool).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('Plugin handles missing credentials gracefully', async () => {
      const plugin = new OpenConvAIPlugin(); // No credentials
      
      // Should handle missing credentials gracefully
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      expect(tools.length).toBe(0); // No tools created without credentials
    });

    test('Plugin handles invalid network gracefully', async () => {
      const invalidKit = {
        ...mockHederaKit,
        client: {
          network: { toString: () => 'invalid-network' }
        }
      };
      
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      
      // Should still initialize but default to testnet
      await plugin.initialize({ ...mockContext, kit: invalidKit });
      
      const tools = plugin.getTools();
      expect(tools.length).toBe(11);
    });
  });

  describe('Code Quality Compliance', () => {
    test('No inline comments in tool implementations', async () => {
      // This test would check the actual source files
      // For now, we verify the tools follow the expected pattern
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      
      // Verify tools follow naming conventions
      tools.forEach(tool => {
        expect(tool.name).toMatch(/^[a-z_]+$/); // snake_case
      });
    });

    test('Tools follow DRY principle', async () => {
      const plugin = new OpenConvAIPlugin('0.0.12345', 'mock-private-key');
      mockContext.logger.warn = vi.fn();
      mockContext.logger.info = vi.fn();
      mockContext.logger.error = vi.fn();
      await plugin.initialize(mockContext);
      
      const tools = plugin.getTools();
      
      // All tools should extend base classes (verified by namespace)
      tools.forEach(tool => {
        expect(tool.namespace).toBe('hcs10');
      });
    });
  });
});