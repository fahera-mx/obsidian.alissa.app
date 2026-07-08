import type { ExportDoc } from "./client";

// =============================================================================
// Obsidian-format note rendering — a faithful port of the CLI writer
// (cli/src/commands/vault.ts renderFile, obsidian branch). Keep the two in
// sync: same frontmatter keys, same wikilink/label/hint semantics, so a vault
// synced by the plugin and one exported by the CLI are byte-compatible.
// =============================================================================

export function yamlString(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
  return `"${escaped}"`;
}

export function linkTitle(title: string): string {
  return title.replace(/[[\]|]/g, " ").replace(/\s+/g, " ").trim() || "untitled";
}

export function docKey(doc: ExportDoc): string {
  return `${doc.docTable}:${doc.docId}`;
}

/** Bundle-relative file path for a doc: vault path minus /vault/, plus .md.
 *  Collapses repeated slashes so a malformed server path can't produce empty
 *  segments; callers still verify with isSafeRelPath and fail LOUDLY. */
export function docRelFile(doc: ExportDoc): string {
  return `${doc.path.replace(/^\/+vault\//u, "").replace(/\/+/gu, "/")}.md`;
}

/** Reject anything that could escape the target folder — aligned with the
 *  CLI's rules (cli/src/commands/vault.ts): no leading slash, no backslash,
 *  and no empty / "." / ".." segments (so "a//b.md" and "a/./b.md" fail too). */
export function isSafeRelPath(rel: string): boolean {
  if (!rel || rel.startsWith("/") || rel.includes("\\")) return false;
  return rel.split("/").every((seg) => seg !== "" && seg !== "." && seg !== "..");
}

export function renderNote(
  doc: ExportDoc,
  fileByKey: Map<string, string>,
  titleByKey: Map<string, string>,
): string {
  const fm: string[] = ["---"];
  fm.push(`alissa_path: ${yamlString(doc.path)}`);
  fm.push(`doc_table: ${yamlString(doc.docTable)}`);
  fm.push(`doc_id: ${yamlString(doc.docId)}`);
  if (doc.updatedAt != null) fm.push(`updated_at: ${yamlString(new Date(doc.updatedAt).toISOString())}`);
  if (doc.status) fm.push(`status: ${yamlString(doc.status)}`);
  fm.push(`type: ${yamlString(doc.nodeType)}`);
  fm.push(`aliases: [${yamlString(doc.title)}]`);
  fm.push("---", "");

  let body = doc.markdown.replace(/\s+$/u, "");

  const refs = doc.refs ?? [];
  if (refs.length > 0) {
    const lines = refs.map((ref) => {
      const key = ref.targetTable && ref.targetId ? `${ref.targetTable}:${ref.targetId}` : undefined;
      const targetRel = key ? fileByKey.get(key) : undefined;
      if (targetRel) {
        const targetTitle = key ? titleByKey.get(key) : undefined;
        const label = linkTitle(targetTitle || ref.title);
        const hint = linkTitle(ref.title);
        const relationHint = targetTitle && hint !== linkTitle(targetTitle) ? ` — ${hint}` : "";
        return `- [[${targetRel.replace(/\.md$/u, "")}|${label}]]${relationHint}`;
      }
      return `- ${ref.title} (${ref.targetPath ?? "not in export"})`;
    });
    body += `\n\n## Links\n\n${lines.join("\n")}`;
  }

  return `${fm.join("\n")}\n${body}\n`;
}
