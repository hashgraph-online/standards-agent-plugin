import {
  GenericPluginContext,
  HederaTool,
  BasePlugin,
  HederaAgentKit,
} from 'hedera-agent-kit';
import {
  IStateManager,
  OpenConvaiState,
  HCS10Builder,
  RegisterAgentTool,
  FindRegistrationsTool,
  InitiateConnectionTool,
  ListConnectionsTool,
  SendMessageToConnectionTool,
  CheckMessagesTool,
  ConnectionMonitorTool,
  ManageConnectionRequestsTool,
  AcceptConnectionRequestTool,
  RetrieveProfileTool,
  ListUnapprovedConnectionRequestsTool,
} from '@hashgraphonline/standards-agent-kit';

export class OpenConvAIPlugin extends BasePlugin {
  id = 'openconvai-standards-agent-kit';
  name = 'OpenConvAI Standards Agent Kit Plugin';
  description =
    'Comprehensive plugin providing all HCS-10 agent tools for registration, connections, and messaging';
  version = '1.0.0';
  author = 'Hashgraph Online';
  namespace = 'openconvai';

  private stateManager?: IStateManager;
  private tools: HederaTool[] = [];

  override async initialize(context: GenericPluginContext): Promise<void> {
    await super.initialize(context);

    const hederaKit = context.config.hederaKit as HederaAgentKit;
    if (!hederaKit) {
      this.context.logger.warn(
        'HederaKit not found in context. OpenConvAI tools will not be available.'
      );
      return;
    }

    try {
      this.stateManager =
        (context.stateManager as IStateManager) || new OpenConvaiState();

      this.initializeTools();

      this.context.logger.info(
        'OpenConvAI Standards Agent Kit Plugin initialized successfully'
      );
    } catch (error) {
      this.context.logger.error(
        'Failed to initialize OpenConvAI plugin:',
        error
      );
    }
  }

  private initializeTools(): void {
    if (!this.stateManager) {
      throw new Error('StateManager must be initialized before creating tools');
    }

    const hederaKit = this.context.config.hederaKit as HederaAgentKit;
    if (!hederaKit) {
      throw new Error('HederaKit not found in context config');
    }

    const hcs10Builder = new HCS10Builder(hederaKit, this.stateManager);

    this.tools = [
      new RegisterAgentTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new FindRegistrationsTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new RetrieveProfileTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new InitiateConnectionTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new ListConnectionsTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new SendMessageToConnectionTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new CheckMessagesTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new ConnectionMonitorTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new ManageConnectionRequestsTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new AcceptConnectionRequestTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
      new ListUnapprovedConnectionRequestsTool({
        hederaKit: hederaKit,
        hcs10Builder: hcs10Builder,
        logger: this.context.logger,
      }),
    ];
  }

  getTools(): HederaTool[] {
    return this.tools;
  }

  getStateManager(): IStateManager | undefined {
    return this.stateManager;
  }

  override async cleanup(): Promise<void> {
    this.tools = [];
    delete this.stateManager;
    if (this.context?.logger) {
      this.context.logger.info(
        'OpenConvAI Standards Agent Kit Plugin cleaned up'
      );
    }
  }
}
