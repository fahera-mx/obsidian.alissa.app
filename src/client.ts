import { requestUrl } from "obsidian";

// =============================================================================
// Alissa API client for the Obsidian plugin (TASK-1980129108).
//
// Uses Obsidian's requestUrl — NOT fetch — because the api service's CORS
// allowlist does not cover the app:// origin; requestUrl bypasses CORS via the
// Electron layer. Mirrors the two export endpoints the CLI uses
// (api/src/routes/v1.ts): GET /v1/vault/export/phases, GET /v1/vault/export.
// =============================================================================

/** Mirrors ExportDoc in convex/vaultExport.ts (source of truth). */
export interface ExportDoc {
  path: string;
  title: string;
  markdown: string;
  docTable: string;
  docId: string;
  updatedAt?: number;
  status?: string;
  nodeType: string;
  refs?: Array<{ targetTable?: string; targetId?: string; targetPath?: string; title: string }>;
}

export interface ExportPage {
  docs: ExportDoc[];
  cursor: string | null;
  done: boolean;
}

const RATE_LIMIT_RETRIES = 8;
const RATE_LIMIT_BASE_MS = 2_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class AlissaApi {
  constructor(
    private readonly base: string,
    private readonly token: string,
  ) {}

  private async get<T>(path: string): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const res = await requestUrl({
        url: `${this.base}${path}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "X-Alissa-Via": "obsidian-plugin",
        },
        throw: false,
      });
      if (res.status === 429 && attempt < RATE_LIMIT_RETRIES) {
        await sleep(Math.min(RATE_LIMIT_BASE_MS * 2 ** attempt, 60_000));
        continue;
      }
      if (res.status === 401) throw new AlissaAuthError();
      if (res.status < 200 || res.status >= 300) {
        const message = (res.json as { message?: string } | undefined)?.message ?? `HTTP ${res.status}`;
        throw new Error(`Alissa API error: ${message}`);
      }
      return res.json as T;
    }
  }

  exportPhases(): Promise<{ phases: string[] }> {
    return this.get("/v1/vault/export/phases");
  }

  exportPage(q: { phase: string; cursor?: string | null; limit?: number }): Promise<ExportPage> {
    const params = new URLSearchParams({ phase: q.phase });
    if (q.cursor) params.set("cursor", q.cursor);
    if (q.limit) params.set("limit", String(q.limit));
    return this.get(`/v1/vault/export?${params.toString()}`);
  }
}

export class AlissaAuthError extends Error {
  constructor() {
    super("Alissa rejected the API token — open the plugin settings and paste a fresh token.");
    this.name = "AlissaAuthError";
  }
}
