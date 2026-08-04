# mcp-crates

Crates.io MCP — wraps the crates.io REST API v1 (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_crates` | Search crates.io for Rust packages by keyword. Returns crate name, description, downloads, latest version, and repo URL. |
| `get_crate` | Get full metadata for a specific crate (e.g., 'serde'). Returns description, downloads, latest version, repo, homepage, and categories. |
| `get_versions` | List all published versions for a crate in reverse chronological order. Returns version number, download count, and publish date. |
| `get_crate_dependencies` | List the dependencies of a specific crate version — what <crate> itself depends on. Returns each dependency with its version requirement, kind (normal/build/dev), optional flag, enabled features, and target. Version is optional (defaults to the latest stable). Use for "what does <crate> depend on", dependency audits, or sizing a crate's footprint. |
| `get_crate_reverse_deps` | List crates that DEPEND ON a given crate (reverse dependencies), most-downloaded first — answers "what uses <crate>", "how widely adopted is <crate>", "who depends on <crate>". Returns the total dependent count plus the top dependents with their version requirement, dependency kind, and download counts. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "crates": {
      "url": "https://gateway.pipeworx.io/crates/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Crates data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
