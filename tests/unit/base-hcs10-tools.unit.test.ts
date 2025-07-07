import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BaseHCS10TransactionTool, BaseHCS10QueryTool } from '../../src/tools/hcs10/base-hcs10-tools';
import { z } from 'zod';

/**
 * Unit tests for BaseHCS10 tool classes
 */
describe('BaseHCS10 Tool Classes', () => {
  let mockHederaKit: any;
  let mockHCS10Builder: any;
  let mockLogger: any;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

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

    // Mock HCS10Builder
    mockHCS10Builder = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        rawResult: { test: 'result' }
      })
    };
  });

  describe('BaseHCS10TransactionTool', () => {
    // Create a test implementation
    class TestTransactionTool extends BaseHCS10TransactionTool {
      name = 'test_transaction_tool';
      description = 'Test transaction tool';
      specificInputSchema = z.object({
        testParam: z.string()
      });

      protected async callBuilderMethod(): Promise<void> {
        // Mock implementation
        return Promise.resolve();
      }
    }

    test('Correctly sets namespace to hcs10', () => {
      const tool = new TestTransactionTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder
      });

      expect(tool.namespace).toBe('hcs10');
    });

    test('Returns HCS10Builder from getServiceBuilder', () => {
      const tool = new TestTransactionTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder
      });

      const builder = (tool as any).getServiceBuilder();
      expect(builder).toBe(mockHCS10Builder);
    });

    test('Has correct schema structure', () => {
      const tool = new TestTransactionTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder
      });

      const schema = tool.schema;
      expect(schema).toBeDefined();
      
      // Should include metaOptions
      const parsed = schema.parse({
        testParam: 'value',
        metaOptions: {}
      });

      expect(parsed.testParam).toBe('value');
      expect(parsed.metaOptions).toBeDefined();
    });
  });

  describe('BaseHCS10QueryTool', () => {
    // Create a test implementation
    class TestQueryTool extends BaseHCS10QueryTool {
      name = 'test_query_tool';
      description = 'Test query tool';
      specificInputSchema = z.object({
        queryParam: z.string()
      });

      protected override async _call(): Promise<string> {
        return 'test result';
      }
      
      protected async executeQuery(): Promise<unknown> {
        return { success: true, data: 'test result' };
      }
    }

    test('Correctly sets namespace to hcs10', () => {
      const tool = new TestQueryTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder,
        logger: mockLogger
      });

      expect(tool.namespace).toBe('hcs10');
    });

    test('Returns HCS10Builder from getServiceBuilder', () => {
      const tool = new TestQueryTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder,
        logger: mockLogger
      });

      const builder = (tool as any).getServiceBuilder();
      expect(builder).toBe(mockHCS10Builder);
    });

    test('Has correct schema without metaOptions', () => {
      const tool = new TestQueryTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder,
        logger: mockLogger
      });

      const schema = tool.schema;
      expect(schema).toBeDefined();
      
      // Query tools don't have metaOptions
      const parsed = schema.parse({
        queryParam: 'value'
      });

      expect(parsed.queryParam).toBe('value');
    });
  });

  describe('Type Safety', () => {
    test('Transaction tool enforces correct Zod types', () => {
      class StrictTransactionTool extends BaseHCS10TransactionTool<
        z.ZodObject<{
          requiredField: z.ZodString;
          optionalField: z.ZodOptional<z.ZodNumber>;
        }>
      > {
        name = 'strict_tool';
        description = 'Strict tool';
        specificInputSchema = z.object({
          requiredField: z.string(),
          optionalField: z.number().optional()
        });

        protected async callBuilderMethod(): Promise<void> {
          return Promise.resolve();
        }
      }

      const tool = new StrictTransactionTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder
      });

      // Should validate correctly
      const schema = tool.schema;
      
      expect(() => {
        schema.parse({ metaOptions: {} }); // Missing required field
      }).toThrow();

      const valid = schema.parse({
        requiredField: 'test',
        metaOptions: {}
      });

      expect(valid.requiredField).toBe('test');
    });

    test('Query tool enforces correct Zod types', () => {
      class StrictQueryTool extends BaseHCS10QueryTool<
        z.ZodObject<{
          accountId: z.ZodString;
        }>
      > {
        name = 'strict_query';
        description = 'Strict query';
        specificInputSchema = z.object({
          accountId: z.string()
        });

        protected async executeQuery(): Promise<any> {
          return {};
        }
      }

      const tool = new StrictQueryTool({
        hederaKit: mockHederaKit,
        hcs10Builder: mockHCS10Builder,
        logger: mockLogger
      });

      const schema = tool.schema;
      
      expect(() => {
        schema.parse({}); // Missing required field
      }).toThrow();

      const valid = schema.parse({
        accountId: '0.0.12345'
      });

      expect(valid.accountId).toBe('0.0.12345');
    });
  });
});