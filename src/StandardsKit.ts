import {
  ServerSigner,
  HederaConversationalAgent,
  getAllHederaCorePlugins,
} from 'hedera-agent-kit';
import type { AgentOperationalMode, AgentResponse } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from './plugins/openconvai/OpenConvAIPlugin';
import { OpenConvaiState } from '@hashgraphonline/standards-agent-kit';
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
}

export class StandardsKit {
  private conversationalAgent?: HederaConversationalAgent;
  private plugin: OpenConvAIPlugin;
  private stateManager: OpenConvaiState;
  private options: StandardsKitOptions;
  private logger: Logger;

  constructor(options: StandardsKitOptions) {
    this.options = options;
    this.stateManager = new OpenConvaiState();
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

      this.conversationalAgent = new HederaConversationalAgent(serverSigner, {
        pluginConfig: {
          plugins: [this.plugin, ...getAllHederaCorePlugins()],
          appConfig: {
            stateManager: this.stateManager,
          },
        },
        openAIApiKey,
        openAIModelName,
        verbose,
        operationalMode,
        userAccountId,
        customSystemMessagePreamble: `You are a helpful assistant managing Hedera HCS-10 connections and messages.
You have access to tools for registering agents, finding registered agents, initiating connections, listing active connections, sending messages over connections, and checking for new messages.

*** IMPORTANT CONTEXT ***
You are currently operating as agent: ${accountId}
When users ask about "my profile", "my account", "my connections", etc., use this account ID: ${accountId}

*** IMPORTANT TOOL SELECTION RULES ***
- To REGISTER a new agent, use 'register_agent'.
- To FIND existing registered agents in the registry, use 'find_registrations'. You can filter by accountId or tags.
- To START a NEW connection TO a specific target agent (using their account ID), ALWAYS use the 'initiate_connection' tool.
- To LISTEN for INCOMING connection requests FROM other agents, use the 'monitor_connections' tool (it takes NO arguments).
- To SEND a message to a specific agent, use 'send_message_to_connection' tool.
- To ACCEPT incoming connection requests, use the 'accept_connection_request' tool.
- To MANAGE and VIEW pending connection requests, use the 'manage_connection_requests' tool.
- To CHECK FOR *NEW* messages since the last check, use the 'check_messages' tool.
- To GET THE *LATEST* MESSAGE(S) in a conversation, even if you might have seen them before, use the 'check_messages' tool and set the parameter 'fetchLatest: true'. You can optionally specify 'lastMessagesCount' to get more than one latest message (default is 1).
- To RETRIEVE a profile, use the 'retrieve_profile' tool. When users ask for "my profile", use the current account ID: ${accountId}
- Do NOT confuse these tools.

Remember the connection numbers when listing connections, as users might refer to them.`,
      });

      await this.conversationalAgent.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize StandardsKit:', error);
      throw error;
    }
  }

  getPlugin(): OpenConvAIPlugin {
    return this.plugin;
  }

  getStateManager(): OpenConvaiState {
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
