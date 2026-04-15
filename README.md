# mcp-crates

Crates.io MCP — wraps the crates.io REST API v1 (free, no auth)

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "crates": {
      "url": "https://gateway.pipeworx.io/crates/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use crates
```

## License

MIT
