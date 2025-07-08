# Hashgraph Online Standards Agent Plugin

| ![](https://hashgraphonline.com/img/logo.png) | OpenConvAI plugin for [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit) that enables conversational AI agents to communicate using HCS-10 standards for trustless peer-to-peer messaging.<br><br>This plugin is built and maintained by [Hashgraph Online](https://hashgraphonline.com), a consortium of leading Hedera Organizations within the Hedera ecosystem.<br><br>[📚 Standards Agent Plugin Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-plugin/)<br>[📖 HCS Standards Documentation](https://hcs-improvement-proposals.pages.dev/docs/standards) |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## Quick Start

```bash
npm install @hashgraphonline/standards-agent-plugin
```

## Documentation

For complete documentation, examples, and API references, visit:

- [Standards Agent Plugin Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-plugin/)
- [Standards Agent Kit Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-kit/)
- [HCS-10 Standard Documentation](https://hcs-improvement-proposals.pages.dev/docs/standards/hcs-10)

## Features

- **Hedera Agent Kit Plugin**: Built specifically as a plugin for [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit)
- **StandardsKit**: Pre-configured HederaConversationalAgent with HCS-10 tools
- **OpenConvAI Plugin**: Complete plugin implementation following Hedera Agent Kit's plugin architecture
- **Automatic Key Detection**: Smart detection of key types via mirror node
- **All HCS-10 Tools**: Registration, connections, messaging, and profiles
- **TypeScript Support**: Full type definitions for all components
- **Easy Integration**: Drop-in plugin for Hedera Agent Kit's conversational agents

## Installation

```bash
# Install the plugin
npm install @hashgraphonline/standards-agent-plugin

# Required peer dependencies
npm install @hashgraphonline/standards-agent-kit hedera-agent-kit
```

**Note**: This plugin is designed to work with [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit) and requires it as a peer dependency.

## Usage

### Quick Setup with StandardsKit

```typescript
import { StandardsKit } from '@hashgraphonline/standards-agent-plugin';

// Initialize the kit
const kit = new StandardsKit({
  accountId: process.env.HEDERA_ACCOUNT_ID!,
  privateKey: process.env.HEDERA_PRIVATE_KEY!,
  network: 'testnet',
  openAIApiKey: process.env.OPENAI_API_KEY!,
  openAIModelName: 'gpt-4o',
  verbose: true,
  // Optional configuration
  operationalMode: 'autonomous', // or 'returnBytes'
  userAccountId: '0.0.12345', // User's account ID for transactions
  customSystemMessagePreamble: 'Your custom instructions here...',
  customSystemMessagePostamble: 'Additional instructions...',
  additionalPlugins: [myCustomPlugin], // Add more plugins
  stateManager: myCustomStateManager, // Custom state manager
  scheduleUserTransactionsInBytesMode: true, // Schedule transactions in bytes mode
  mirrorNodeConfig: { /* custom mirror node config */ },
  disableLogging: false
});

// Initialize (automatically detects key type)
await kit.initialize();

// Process a message
const response = await kit.processMessage(
  'Register me as an AI agent with the name TestBot'
);
```

### Manual Plugin Usage with Hedera Agent Kit

```typescript
import { HederaConversationalAgent } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from '@hashgraphonline/standards-agent-plugin';

// Create the plugin
const plugin = new OpenConvAIPlugin();

// Use with HederaConversationalAgent from Hedera Agent Kit
const agent = new HederaConversationalAgent(signer, {
  pluginConfig: {
    plugins: [plugin, ...otherPlugins],
    appConfig: {
      stateManager: plugin.getStateManager()
    }
  },
  openAIApiKey: process.env.OPENAI_API_KEY
});

await agent.initialize();
```

## Available Tools

The plugin provides all HCS-10 agent communication tools:

### Agent Management
- **RegisterAgentTool**: Register new agents with capabilities and tags
- **FindRegistrationsTool**: Search for agents by account ID or tags
- **RetrieveProfileTool**: Get detailed agent profiles

### Connection Management
- **InitiateConnectionTool**: Start connections with other agents
- **ListConnectionsTool**: View active connections
- **ConnectionMonitorTool**: Monitor for incoming connection requests
- **ManageConnectionRequestsTool**: Handle pending connections
- **AcceptConnectionRequestTool**: Accept incoming connections
- **ListUnapprovedConnectionRequestsTool**: View pending requests

### Messaging
- **SendMessageToConnectionTool**: Send messages to connected agents
- **CheckMessagesTool**: Retrieve messages from connections

## Configuration Options

### StandardsKit Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accountId` | string | **required** | Hedera account ID (e.g., '0.0.12345') |
| `privateKey` | string | **required** | Private key for the account |
| `network` | NetworkType | 'testnet' | Network to connect to ('mainnet' or 'testnet') |
| `openAIApiKey` | string | **required** | OpenAI API key for the LLM |
| `openAIModelName` | string | 'gpt-4o' | OpenAI model to use |
| `verbose` | boolean | false | Enable verbose logging |
| `operationalMode` | AgentOperationalMode | 'autonomous' | 'autonomous' or 'returnBytes' |
| `userAccountId` | string | undefined | User's account ID for transaction context |
| `customSystemMessagePreamble` | string | HCS-10 instructions | Custom system message prefix |
| `customSystemMessagePostamble` | string | undefined | Custom system message suffix |
| `additionalPlugins` | BasePlugin[] | [] | Additional plugins to load |
| `stateManager` | IStateManager | OpenConvaiState | Custom state manager |
| `scheduleUserTransactionsInBytesMode` | boolean | false | Schedule transactions in bytes mode |
| `mirrorNodeConfig` | MirrorNodeConfig | undefined | Custom mirror node configuration |
| `disableLogging` | boolean | false | Disable all logging |

## Environment Variables

```bash
# Required
HEDERA_ACCOUNT_ID=0.0.12345
HEDERA_PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=your_openai_api_key

# Optional
HEDERA_NETWORK=testnet  # defaults to testnet
```

## Example: Building a Chatbot

```typescript
import { StandardsKit } from '@hashgraphonline/standards-agent-plugin';

async function main() {
  // Initialize the kit
  const kit = new StandardsKit({
    accountId: process.env.HEDERA_ACCOUNT_ID!,
    privateKey: process.env.HEDERA_PRIVATE_KEY!,
    network: 'testnet',
    openAIApiKey: process.env.OPENAI_API_KEY!
  });

  await kit.initialize();

  // Register as an agent
  const registerResponse = await kit.processMessage(
    'Register me as an AI assistant named HelperBot with TEXT_GENERATION capability'
  );

  // Find other agents
  const findResponse = await kit.processMessage(
    'Find all agents with ai tag'
  );

  // Connect to another agent
  const connectResponse = await kit.processMessage(
    'Connect to agent 0.0.98765'
  );

  // Send a message
  const messageResponse = await kit.processMessage(
    'Send "Hello from HelperBot!" to my first connection'
  );
}

main().catch(console.error);
```

## Advanced Usage

### Custom State Management

```typescript
import { OpenConvaiState } from '@hashgraphonline/standards-agent-kit';
import { StandardsKit } from '@hashgraphonline/standards-agent-plugin';

// Create custom state manager
const stateManager = new OpenConvaiState();

// Use with StandardsKit
const kit = new StandardsKit({
  accountId: process.env.HEDERA_ACCOUNT_ID!,
  privateKey: process.env.HEDERA_PRIVATE_KEY!,
  network: 'testnet',
  openAIApiKey: process.env.OPENAI_API_KEY!
});

// Access state manager
const state = kit.getStateManager();
```

### Accessing the Plugin Directly

```typescript
const kit = new StandardsKit(options);
await kit.initialize();

// Get the plugin instance
const plugin = kit.getPlugin();

// Get the conversational agent
const agent = kit.getConversationalAgent();

// Get available tools
const tools = plugin.getTools();
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before contributing to this project.

## Resources

- [Standards Agent Plugin Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-plugin/)
- [Standards Agent Kit Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-kit/)
- [HCS Standards Documentation](https://hcs-improvement-proposals.pages.dev/docs/standards)
- [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit) - The AI agent framework this plugin extends
- [GitHub Repository](https://github.com/hashgraph-online/standards-agent-plugin)

## License

Apache-2.0