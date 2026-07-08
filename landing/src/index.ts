import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import helmet from "helmet";

import { renderLandingPage } from "./lib/page.js";

// =============================================================================
// ALISSA SYNC LANDING — obsidian.alissa.app
//
// The marketing page for the Alissa Sync Obsidian plugin. Server-renders a
// static, zero-JS page (see lib/page.ts) once at startup and serves it on
// every request.
// =============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "3005", 10);
const BASE_URL = process.env.BASE_URL || "https://obsidian.alissa.app";
const STUDIO_URL = "https://studio.alissa.app";
const REPO_URL = "https://github.com/fahera-mx/obsidian.alissa.app";

// The page only changes on deploy, so render once at startup.
const html = renderLandingPage({
  baseUrl: BASE_URL,
  studioUrl: STUDIO_URL,
  repoUrl: REPO_URL,
});

const app = express();

// ── Security Headers ────────────────────────────────────────────────────────
// Relaxed — this is entirely public marketing content meant to be crawled and
// unfurled by social platforms. CSP is off because the page inlines its styles
// and pulls fonts from Google Fonts.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// ── Static Assets ───────────────────────────────────────────────────────────
app.use("/static", express.static(path.resolve(__dirname, "../static"), {
  maxAge: "7d",
  immutable: true,
}));

// ── robots.txt — allow all crawlers ─────────────────────────────────────────

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(["User-agent: *", "Allow: /"].join("\n"));
});

// ── Health Check ────────────────────────────────────────────────────────────

const health = (_req: express.Request, res: express.Response): void => {
  res.json({
    status: "ok",
    service: "obsidian.alissa.app",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", health);
app.get("/healthz", health);

// ── Landing Page ────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.type("html").send(html);
});

// ── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.redirect(302, "/");
});

// ── Error Handler ───────────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Landing Error]", err);
  res.redirect(302, "/");
});

// ── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✦ Alissa Sync landing running on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Landing: http://localhost:${PORT}/\n`);
});
