import {
  ServerSigner,
  HederaConversationalAgent,
  getAllHederaCorePlugins,
  BasePlugin,
} from 'hedera-agent-kit';
import type {
  AgentOperationalMode,
  AgentResponse,
  HederaConversationalAgentConfig,
  MirrorNodeConfig,
} from 'hedera-agent-kit';
import { OpenConvAIPlugin } from './plugins/openconvai/OpenConvAIPlugin';
import { OpenConvaiState } from '@hashgraphonline/standards-agent-kit';
import type { IStateManager } from '@hashgraphonline/standards-agent-kit';
import {
  Logger,
  HederaMirrorNode,
  type NetworkType,
} from '@hashgraphonline/standards-sdk';
import { PrivateKey } from '@hashgraph/sdk';

export interface StandardsKitOptions {
  accountId: string;
  privateKey: string;
  network?: NetworkType;
  openAIApiKey: string;
  openAIModelName?: string;
  verbose?: boolean;
  operationalMode?: AgentOperationalMode;
  userAccountId?: string;
  customSystemMessagePreamble?: string;
  customSystemMessagePostamble?: string;
  additionalPlugins?: BasePlugin[];
  stateManager?: IStateManager;
  scheduleUserTransactionsInBytesMode?: boolean;
  mirrorNodeConfig?: MirrorNodeConfig;
  disableLogging?: boolean;
}

/**
 * The StandardsKit class is an optional wrapper around the HederaConversationalAgent class,
 * which includes the OpenConvAIPlugin and the OpenConvaiState by default.
 * If you want to use a different plugin or state manager, you can pass them in the options.
 * This class is not required and the plugin can be used directly with the HederaConversationalAgent class.
 *
 * @param options - The options for the StandardsKit.
 * @returns A new instance of the StandardsKit class.
 */
export class StandardsKit {
  public conversationalAgent?: HederaConversationalAgent;
  public plugin: OpenConvAIPlugin;
  public stateManager: IStateManager;
  private options: StandardsKitOptions;
  private logger: Logger;

  constructor(options: StandardsKitOptions) {
    this.options = options;
    this.stateManager = options.stateManager || new OpenConvaiState();
    this.plugin = new OpenConvAIPlugin();
    this.logger = new Logger({ module: 'StandardsKit' });
  }

  async initialize(): Promise<void> {
    const {
      accountId,
      privateKey,
      network = 'testnet',
      openAIApiKey,
      openAIModelName = 'gpt-4o',
      verbose = false,
      operationalMode = 'autonomous',
      userAccountId,
      customSystemMessagePreamble,
      customSystemMessagePostamble,
      additionalPlugins = [],
      scheduleUserTransactionsInBytesMode,
      mirrorNodeConfig,
      disableLogging,
    } = this.options;

    if (!accountId || !privateKey) {
      throw new Error('Account ID and private key are required');
    }

    try {
      const mirrorNode = new HederaMirrorNode(network, this.logger);
      const accountInfo = await mirrorNode.requestAccount(accountId);
      const keyType = accountInfo?.key?._type || '';

      let privateKeyInstance: PrivateKey;
      if (keyType?.toLowerCase()?.includes('ecdsa')) {
        privateKeyInstance = PrivateKey.fromStringECDSA(privateKey);
      } else {
        privateKeyInstance = PrivateKey.fromStringED25519(privateKey);
      }

      const serverSigner = new ServerSigner(
        accountId,
        privateKeyInstance,
        network
      );

      const defaultSystemMessage = `You are a helpful assistant managing Hedera HCS-10 connections and messages.
You have access to tools for registering agents, finding registered agents, initiating connections, listing active connections, sending messages over connections, and checking for new messages.

*** IMPORTANT CONTEXT ***
You are currently operating as agent: ${accountId}
When users ask about "my profile", "my account", "my connections", etc., use this account ID: ${accountId}

Remember the connection numbers when listing connections, as users might refer to them.`;

      const allPlugins = [
        this.plugin,
        ...additionalPlugins,
        ...getAllHederaCorePlugins(),
      ];

      const agentConfig: HederaConversationalAgentConfig = {
        pluginConfig: {
          plugins: allPlugins,
          appConfig: {
            stateManager: this.stateManager,
          },
        },
        openAIApiKey,
        openAIModelName,
        verbose,
        operationalMode,
        userAccountId,
        customSystemMessagePreamble:
          customSystemMessagePreamble || defaultSystemMessage,
        ...(customSystemMessagePostamble !== undefined && {
          customSystemMessagePostamble,
        }),
        ...(scheduleUserTransactionsInBytesMode !== undefined && {
          scheduleUserTransactionsInBytesMode,
        }),
        ...(mirrorNodeConfig !== undefined && { mirrorNodeConfig }),
        ...(disableLogging !== undefined && { disableLogging }),
      };

      this.conversationalAgent = new HederaConversationalAgent(
        serverSigner,
        agentConfig
      );

      await this.conversationalAgent.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize StandardsKit:', error);
      throw error;
    }
  }

  getPlugin(): OpenConvAIPlugin {
    return this.plugin;
  }

  getStateManager(): IStateManager {
    return this.stateManager;
  }

  getConversationalAgent(): HederaConversationalAgent {
    if (!this.conversationalAgent) {
      throw new Error('StandardsKit not initialized. Call initialize() first.');
    }
    return this.conversationalAgent;
  }

  async processMessage(
    message: string,
    chatHistory: {
      type: 'human' | 'ai';
      content: string;
    }[] = []
  ): Promise<AgentResponse> {
    if (!this.conversationalAgent) {
      throw new Error('StandardsKit not initialized. Call initialize() first.');
    }
    return this.conversationalAgent.processMessage(message, chatHistory);
  }
}
