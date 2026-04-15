interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Crates.io MCP — wraps the crates.io REST API v1 (free, no auth)
 *
 * Tools:
 * - search_crates: search for crates by keyword
 * - get_crate: fetch metadata for a specific crate
 * - get_versions: list published versions for a crate
 */


const BASE = 'https://crates.io/api/v1';
// crates.io requires a descriptive User-Agent per their policy
const USER_AGENT = 'pipeworx-mcp/0.1.0 (https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_crates',
    description:
      'Search crates.io for Rust crates by keyword. Returns name, description, total downloads, newest version, and repository URL.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default 10, max 100)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_crate',
    description:
      'Get metadata for a specific crate: name, description, total downloads, newest version, repository, homepage, and categories.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Exact crate name (e.g., "serde", "tokio")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_versions',
    description:
      'List all published versions for a crate, ordered newest first. Returns version number, download count, and publish date.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Crate name',
        },
      },
      required: ['name'],
    },
  },
];

async function cratesGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Crate not found: ${path}`);
    throw new Error(`crates.io API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function searchCrates(query: string, limit: number) {
  const perPage = Math.min(100, Math.max(1, limit));
  const params = new URLSearchParams({ q: query, per_page: String(perPage) });
  const data = (await cratesGet(`/crates?${params}`)) as {
    crates: {
      name: string;
      description: string | null;
      downloads: number;
      newest_version: string;
      repository: string | null;
      homepage: string | null;
      max_stable_version: string | null;
      updated_at: string;
    }[];
    meta: { total: number };
  };

  return {
    total: data.meta.total,
    crates: data.crates.map((c) => ({
      name: c.name,
      description: c.description ?? null,
      downloads: c.downloads,
      newest_version: c.newest_version,
      max_stable_version: c.max_stable_version ?? null,
      repository: c.repository ?? null,
      homepage: c.homepage ?? null,
      updated_at: c.updated_at,
    })),
  };
}

async function getCrate(name: string) {
  const data = (await cratesGet(`/crates/${encodeURIComponent(name)}`)) as {
    crate: {
      name: string;
      description: string | null;
      downloads: number;
      recent_downloads: number | null;
      newest_version: string;
      max_stable_version: string | null;
      repository: string | null;
      homepage: string | null;
      documentation: string | null;
      created_at: string;
      updated_at: string;
      categories: string[];
      keywords: string[];
    };
  };

  const c = data.crate;
  return {
    name: c.name,
    description: c.description ?? null,
    downloads: c.downloads,
    recent_downloads: c.recent_downloads ?? null,
    newest_version: c.newest_version,
    max_stable_version: c.max_stable_version ?? null,
    repository: c.repository ?? null,
    homepage: c.homepage ?? null,
    documentation: c.documentation ?? null,
    categories: c.categories ?? [],
    keywords: c.keywords ?? [],
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

async function getVersions(name: string) {
  const data = (await cratesGet(`/crates/${encodeURIComponent(name)}/versions`)) as {
    versions: {
      num: string;
      downloads: number;
      created_at: string;
      yanked: boolean;
      license: string | null;
      rust_version: string | null;
    }[];
  };

  return {
    crate: name,
    versions: data.versions.map((v) => ({
      version: v.num,
      downloads: v.downloads,
      published_at: v.created_at,
      yanked: v.yanked,
      license: v.license ?? null,
      rust_version: v.rust_version ?? null,
    })),
  };
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_crates':
      return searchCrates(args.query as string, (args.limit as number) ?? 10);
    case 'get_crate':
      return getCrate(args.name as string);
    case 'get_versions':
      return getVersions(args.name as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool } satisfies McpToolExport;
