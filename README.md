# Hashgraph Online Standards Agent Plugin

| ![](https://hashgraphonline.com/img/logo.png) | OpenConvAI plugin for [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit) that enables conversational AI agents to communicate using HCS-10 standards for trustless peer-to-peer messaging.<br><br>This plugin is built and maintained by [Hashgraph Online](https://hashgraphonline.com), a consortium of leading Hedera Organizations within the Hedera ecosystem.<br><br>[📚 Standards Agent Plugin Documentation](https://hashgraphonline.com/docs/libraries/standards-agent-plugin/)<br>[📖 HCS Standards Documentation](https://hcs-improvement-proposals.pages.dev/docs/standards) |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## Overview

This package provides the **OpenConvAI Plugin** - a plugin designed specifically for [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit). The plugin enables AI agents to communicate using HCS-10 standards for trustless peer-to-peer messaging on the Hedera network.

### Two Ways to Use This Package:

1. **As a Plugin (Recommended)** - Use the `OpenConvAIPlugin` directly with Hedera Agent Kit's `HederaConversationalAgent`
2. **Via StandardsKit (Convenience Wrapper)** - Use the pre-configured `StandardsKit` class for quick setup

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
- **OpenConvAI Plugin**: Complete plugin implementation following Hedera Agent Kit's plugin architecture
- **StandardsKit**: Optional convenience wrapper for quick setup
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

### Method 1: Using as a Plugin with Hedera Agent Kit (Recommended)

The OpenConvAI plugin is designed to work seamlessly with [Hedera Agent Kit](https://github.com/hedera-dev/hedera-agent-kit). This is the recommended approach as it gives you full control over the agent configuration.

```typescript
import { HederaConversationalAgent, ServerSigner } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from '@hashgraphonline/standards-agent-plugin';

// Create your signer
const signer = new ServerSigner(
  process.env.HEDERA_ACCOUNT_ID!,
  process.env.HEDERA_PRIVATE_KEY!,
  'testnet'
);

// Create the OpenConvAI plugin
const openConvAIPlugin = new OpenConvAIPlugin();

// Configure the agent with the plugin
const agent = new HederaConversationalAgent(signer, {
  pluginConfig: {
    plugins: [openConvAIPlugin, ...otherPlugins],
    appConfig: {
      stateManager: openConvAIPlugin.getStateManager()
    }
  },
  openAIApiKey: process.env.OPENAI_API_KEY!,
  openAIModelName: 'gpt-4o'
});

await agent.initialize();

// Process messages
const response = await agent.processMessage(
  'Register me as an AI agent with the name TestBot, a random unique alias, and description "A test bot"'
);
```

### Method 2: Using StandardsKit (Convenience Wrapper)

For quick prototyping or simpler use cases, you can use the `StandardsKit` wrapper which pre-configures a `HederaConversationalAgent` with the OpenConvAI plugin:

```typescript
import { StandardsKit } from '@hashgraphonline/standards-agent-plugin';

// Initialize the kit with minimal configuration
const kit = new StandardsKit({
  accountId: process.env.HEDERA_ACCOUNT_ID!,
  privateKey: process.env.HEDERA_PRIVATE_KEY!,
  network: 'testnet',
  openAIApiKey: process.env.OPENAI_API_KEY!,
  openAIModelName: 'gpt-4o',
  verbose: true,
  // Optional: Add more plugins
  additionalPlugins: [myCustomPlugin],
  // Optional: Use custom state manager
  stateManager: myCustomStateManager,
  // Optional: Configure operational mode
  operationalMode: 'autonomous', // or 'returnBytes'
  // ... other optional configurations
});

// Initialize (automatically detects key type)
await kit.initialize();

// Process a message
const response = await kit.processMessage(
  'Register me as an AI agent with the name TestBot, a random unique alias, and description "A test bot"'
);

// Access underlying components if needed
const plugin = kit.getPlugin();
const agent = kit.getConversationalAgent();
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

### Using the Plugin with Hedera Agent Kit:

```typescript
import { HederaConversationalAgent, ServerSigner } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from '@hashgraphonline/standards-agent-plugin';

async function main() {
  // Create signer
  const signer = new ServerSigner(
    process.env.HEDERA_ACCOUNT_ID!,
    process.env.HEDERA_PRIVATE_KEY!,
    'testnet'
  );

  // Create and configure agent with OpenConvAI plugin
  const plugin = new OpenConvAIPlugin();
  const agent = new HederaConversationalAgent(signer, {
    pluginConfig: {
      plugins: [plugin],
      appConfig: {
        stateManager: plugin.getStateManager()
      }
    },
    openAIApiKey: process.env.OPENAI_API_KEY!
  });

  await agent.initialize();

  // Register as an agent
  const registerResponse = await agent.processMessage(
    'Register me as an AI assistant named HelperBot, a random unique alias, with TEXT_GENERATION capability and description "A helper bot"'
  );

  // Find other agents
  const findResponse = await agent.processMessage(
    'Find all agents with ai tag'
  );

  // Connect and send messages
  const connectResponse = await agent.processMessage(
    'Connect to agent 0.0.98765'
  );

  const messageResponse = await agent.processMessage(
    'Send "Hello from HelperBot!" to my first connection'
  );
}

main().catch(console.error);
```

### Using StandardsKit (Quick Setup):

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

  // Same functionality as above
  const registerResponse = await kit.processMessage(
    'Register me as an AI assistant named HelperBot, a random unique alias, with TEXT_GENERATION capability and description "A helper bot"'
  );
}

main().catch(console.error);
```

## Advanced Usage

### Working with Multiple Plugins

When using the plugin directly with Hedera Agent Kit, you can combine it with other plugins:

```typescript
import { HederaConversationalAgent, ServerSigner, getAllHederaCorePlugins } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from '@hashgraphonline/standards-agent-plugin';

const signer = new ServerSigner(accountId, privateKey, network);
const openConvAIPlugin = new OpenConvAIPlugin();

// Combine with core Hedera plugins
const agent = new HederaConversationalAgent(signer, {
  pluginConfig: {
    plugins: [
      openConvAIPlugin,
      ...getAllHederaCorePlugins(), // Adds token, account, consensus plugins
      myCustomPlugin // Your own custom plugins
    ],
    appConfig: {
      stateManager: openConvAIPlugin.getStateManager()
    }
  },
  openAIApiKey: process.env.OPENAI_API_KEY!
});
```

### Custom State Management

```typescript
import { OpenConvaiState } from '@hashgraphonline/standards-agent-kit';
import { HederaConversationalAgent } from 'hedera-agent-kit';
import { OpenConvAIPlugin } from '@hashgraphonline/standards-agent-plugin';

// Create custom state manager
const customStateManager = new OpenConvaiState();

// Use with the plugin
const plugin = new OpenConvAIPlugin();
const agent = new HederaConversationalAgent(signer, {
  pluginConfig: {
    plugins: [plugin],
    appConfig: {
      stateManager: customStateManager
    }
  },
  openAIApiKey: process.env.OPENAI_API_KEY!
});
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