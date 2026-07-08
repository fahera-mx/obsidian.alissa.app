import { Vault, normalizePath } from "obsidian";
import { AlissaApi, type ExportDoc } from "./client";
import { docKey, docRelFile, isSafeRelPath, renderNote } from "./render";

// =============================================================================
// Sync engine — the CLI's collect/render/manifest pipeline ported onto the
// Obsidian vault API (TASK-1980129108). Incremental semantics are identical:
// written / unchanged / moved / deleted, driven by a sha256 manifest that the
// plugin persists in its data.json instead of a dotfile inside the vault.
// =============================================================================

export interface SyncManifestEntry {
  file: string;
  updatedAt: number | null;
  hash: string;
}
export type SyncManifest = Record<string, SyncManifestEntry>;

export interface SyncSummary {
  docs: number;
  written: number;
  unchanged: number;
  moved: number;
  deleted: number;
}

const EXPORT_PAGE_LIMIT = 50;

/** WebCrypto sha256 (hex) — works on Obsidian desktop AND mobile (no node:crypto). */
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function collectDocs(api: AlissaApi, onPhase?: (phase: string, count: number) => void): Promise<ExportDoc[]> {
  const { phases } = await api.exportPhases();
  const byKey = new Map<string, ExportDoc>();
  for (const phase of phases) {
    let cursor: string | null = null;
    let count = 0;
    for (;;) {
      const page = await api.exportPage({ phase, cursor, limit: EXPORT_PAGE_LIMIT });
      for (const doc of page.docs) {
        const key = docKey(doc);
        if (!byKey.has(key)) {
          byKey.set(key, doc);
          count += 1;
        }
      }
      if (page.done || !page.cursor) break;
      cursor = page.cursor;
    }
    onPhase?.(phase, count);
  }
  return [...byKey.values()];
}

async function ensureParentFolder(vault: Vault, filePath: string): Promise<void> {
  const dir = filePath.split("/").slice(0, -1).join("/");
  if (!dir) return;
  if (!(await vault.adapter.exists(dir))) {
    await vault.adapter.mkdir(dir);
  }
}

async function removeIfPresent(vault: Vault, filePath: string): Promise<void> {
  try {
    if (await vault.adapter.exists(filePath)) await vault.adapter.remove(filePath);
  } catch {
    // A stale manifest entry (e.g. the user turned the file into a folder)
    // must not abort the sync; the manifest rewrite below heals it.
  }
}

export async function syncVault(opts: {
  vault: Vault;
  api: AlissaApi;
  targetFolder: string;
  incremental: boolean;
  previousManifest: SyncManifest;
  onPhase?: (phase: string, count: number) => void;
}): Promise<{ summary: SyncSummary; manifest: SyncManifest }> {
  const { vault, api, incremental } = opts;
  const root = normalizePath(opts.targetFolder).replace(/\/+$/u, "");
  // The mirror folder is user-configurable — hold it to the same safe-path
  // rules as rendered doc paths so it can never escape the vault subtree.
  if (!isSafeRelPath(`${root}/x`)) {
    throw new Error(`Alissa Sync: target folder "${opts.targetFolder}" is not a plain vault subfolder.`);
  }
  const docs = await collectDocs(api, opts.onPhase);

  // Pass 1: file paths + titles for link rewriting.
  const fileByKey = new Map<string, string>();
  const titleByKey = new Map<string, string>();
  for (const doc of docs) {
    fileByKey.set(docKey(doc), docRelFile(doc));
    titleByKey.set(docKey(doc), doc.title);
  }

  const oldManifest = incremental ? opts.previousManifest : {};
  const manifest: SyncManifest = {};
  const summary: SyncSummary = { docs: docs.length, written: 0, unchanged: 0, moved: 0, deleted: 0 };

  // Pass 2: render + write.
  for (const doc of docs) {
    const key = docKey(doc);
    const rel = fileByKey.get(key)!;
    // Fail LOUDLY (CLI parity) — a partial silent sync is worse than an error.
    if (!isSafeRelPath(rel)) throw new Error(`Alissa Sync: refusing unsafe server path "${doc.path}".`);
    const content = renderNote(doc, fileByKey, titleByKey);
    const hash = await sha256Hex(content);
    manifest[key] = { file: rel, updatedAt: doc.updatedAt ?? null, hash };

    const target = normalizePath(`${root}/${rel}`);
    const old = oldManifest[key];
    if (incremental && old && typeof old.file === "string" && typeof old.hash === "string") {
      if (old.file !== rel) {
        if (isSafeRelPath(old.file)) await removeIfPresent(vault, normalizePath(`${root}/${old.file}`));
        await ensureParentFolder(vault, target);
        await vault.adapter.write(target, content);
        summary.moved += 1;
        continue;
      }
      if (old.hash === hash && (await vault.adapter.exists(target))) {
        summary.unchanged += 1;
        continue;
      }
    }
    await ensureParentFolder(vault, target);
    await vault.adapter.write(target, content);
    summary.written += 1;
  }

  // Docs that vanished from the export: remove their files.
  if (incremental) {
    for (const [key, old] of Object.entries(oldManifest)) {
      if (key.startsWith("__")) continue;
      if (!manifest[key] && old && typeof old.file === "string" && isSafeRelPath(old.file)) {
        await removeIfPresent(vault, normalizePath(`${root}/${old.file}`));
        summary.deleted += 1;
      }
    }
  }

  return { summary, manifest };
}
