// =============================================================================
// ALISSA SYNC LANDING PAGE — server-rendered, zero-JS.
//
// Design: the Alissa editorial system (high-performance minimalism — mono
// overlines, hairline dividers, rationed color, stroke icons) on warm cream
// with the brand gold and deep verde ink. Serif display (Fraunces), Inter body.
//
// Content: the Obsidian angle — "Your Alissa workspace, inside Obsidian."
// The hero message is the wikilinked knowledge graph: task dependency trees
// and project hierarchies rendering in Obsidian's graph view.
// =============================================================================

export interface PageOptions {
  /** This site's public base, e.g. https://obsidian.alissa.app */
  baseUrl: string;
  /** The Alissa Studio web app, e.g. https://studio.alissa.app */
  studioUrl: string;
  /** The public plugin repository, e.g. https://github.com/fahera-mx/obsidian.alissa.app */
  repoUrl: string;
}

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ── Stroke icons (24×24, strokeWidth 1.5 — per design system) ────────────────

const icon = (paths: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  file: icon(
    `<path d="M13.5 3H7a1.5 1.5 0 00-1.5 1.5v15A1.5 1.5 0 007 21h10a1.5 1.5 0 001.5-1.5V8L13.5 3z"/><path d="M13.5 3v5h5"/><path d="M9 12.5h6"/><path d="M9 16h6"/>`,
  ),
  graph: icon(
    `<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.2 7.2l7.4 0.5"/><path d="M6.8 8.3L8.4 15.8"/><path d="M11.2 16.7l5.4-6.5"/>`,
  ),
  table: icon(
    `<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16"/><path d="M10 10v9"/>`,
  ),
  mirror: icon(
    `<path d="M4 12h13"/><path d="M13.5 8.5L17 12l-3.5 3.5"/><path d="M20 5v14"/>`,
  ),
  refresh: icon(
    `<path d="M20 12a8 8 0 10-2.34 5.66"/><path d="M20 12v-5"/><path d="M20 12h-5"/>`,
  ),
  check: icon(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`),
} as const;

// ── SEO structured data ──────────────────────────────────────────────────────

function jsonLd(opts: PageOptions): string {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Alissa",
        url: opts.studioUrl,
      },
      {
        "@type": "WebSite",
        name: "Alissa Sync for Obsidian",
        url: opts.baseUrl,
      },
      {
        "@type": "SoftwareApplication",
        name: "Alissa Sync",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Obsidian (Windows, macOS, Linux)",
        url: opts.baseUrl,
        description:
          "An Obsidian plugin that mirrors your Alissa workspace — projects, tasks, context docs, deliverables, and entities — into your vault as wikilinked markdown.",
        offers: [{ "@type": "Offer", price: "0", priceCurrency: "USD" }],
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function renderLandingPage(opts: PageOptions): string {
  const { baseUrl, studioUrl, repoUrl } = opts;
  const title = "Alissa Sync — your Alissa workspace, inside Obsidian";
  const description =
    "Mirror your Alissa workspace into Obsidian: projects, tasks, context docs, deliverables, and entities as wikilinked markdown. Dependency trees and project hierarchies light up your graph view.";
  const canonicalUrl = `${baseUrl}/`;
  const ogImageUrl = `${baseUrl}/static/alissa-verde.jpeg`;

  const stats: { icon: string; label: string }[] = [
    { icon: ICONS.file, label: "Real Markdown<br>Files" },
    { icon: ICONS.graph, label: "Wikilinked<br>Knowledge Graph" },
    { icon: ICONS.table, label: "Dataview-Ready<br>Frontmatter" },
    { icon: ICONS.mirror, label: "One-Way<br>Live Mirror" },
    { icon: ICONS.refresh, label: "Incremental<br>Sync" },
  ];

  const chain: { glyph: string; name: string; blurb: string }[] = [
    { glyph: "◆", name: "Projects", blurb: "Each project is a note; its milestones and bodies of work link beneath it." },
    { glyph: "☐", name: "Tasks", blurb: "Status, definition of done, and wikilinks to every dependency." },
    { glyph: "▤", name: "Context docs", blurb: "The briefs and notes attached to your work, as plain markdown." },
    { glyph: "⬥", name: "Deliverables", blurb: "Documents and decks produced by you or your agents." },
    { glyph: "◎", name: "Entities", blurb: "People, orgs, and things — linked from every note that mentions them." },
  ];

  return `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonicalUrl)}">
<link rel="icon" type="image/jpeg" href="/static/alissa-verde.jpeg">
<link rel="apple-touch-icon" href="/static/alissa-verde.jpeg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alissa Sync for Obsidian">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonicalUrl)}">
<meta property="og:image" content="${esc(ogImageUrl)}">
<meta property="og:image:alt" content="Alissa Sync — Obsidian plugin">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImageUrl)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(opts)}</script>
<style>
  :root {
    /* Sampled from the official logo files (alissa-marfil / alissa-verde),
       so the JPG marks blend seamlessly into their surfaces. */
    --cream: #F4ECE1;          /* marfil — page background */
    --cream-soft: #FBF6EE;     /* raised cells */
    --ink: #182424;            /* verde — brand deep teal-green */
    --ink-2: #46544F;          /* body text */
    --ink-3: #75827C;          /* muted */
    --gold: #C8A969;           /* official gold — decorative, large type */
    --gold-deep: #94743B;      /* gold for small text (AA on marfil) */
    --line: rgba(24, 36, 36, 0.14);
    --band-text: #EDE8DA;
    --band-text-2: #B9C2BB;
    --radius-md: 10px;
    --radius-lg: 16px;
    --serif: "Fraunces", Georgia, serif;
    --sans: "Inter", system-ui, -apple-system, sans-serif;
    --mono: ui-monospace, "SF Mono", Menlo, monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--cream);
    color: var(--ink-2);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; }
  code {
    font-family: var(--mono);
    font-size: 0.875em;
    background: rgba(24, 36, 36, 0.06);
    border-radius: 4px;
    padding: 0.1em 0.35em;
  }
  .container { max-width: 1020px; margin: 0 auto; padding: 0 1.5rem; }

  .overline {
    font-family: var(--mono);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--gold-deep);
  }

  /* ── Masthead ─────────────────────────────────────────────────────────── */
  .masthead { text-align: center; padding: 2.4rem 1.5rem 0; }
  .masthead-mark {
    /* Official mark on marfil — the JPG background matches --cream exactly,
       so it reads as a floating logo, not an image tile. */
    display: block; margin: 0 auto -0.5rem;
    width: 120px; height: 120px; object-fit: cover;
  }
  .wordmark {
    font-family: var(--serif);
    font-size: clamp(2.4rem, 6vw, 3.2rem);
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--gold);
    text-decoration: none;
    line-height: 1;
  }
  .wordmark .spark { font-size: 0.45em; vertical-align: 1.1em; margin-left: 0.06em; }
  .wordmark-sub {
    font-family: var(--sans);
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.5em;
    text-indent: 0.5em;
    text-transform: uppercase;
    color: var(--ink);
    margin-top: 0.6rem;
  }
  .spark-divider {
    display: flex; flex-direction: column; align-items: center;
    gap: 0.4rem; margin: 2.2rem 0 0; color: var(--gold);
  }
  .spark-divider::before, .spark-divider::after {
    content: ""; width: 1px; height: 26px; background: var(--gold);
    opacity: 0.55;
  }

  /* ── Hero ─────────────────────────────────────────────────────────────── */
  .hero {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 3.5rem;
    align-items: center;
    padding: 4.5rem 0 5rem;
  }
  .pill {
    display: inline-flex; align-items: center; gap: 0.35rem;
    font-size: 0.6875rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    padding: 0.35rem 0.85rem; border-radius: 999px;
    white-space: nowrap;
  }
  .hero .pill {
    color: var(--gold-deep);
    border: 1px solid rgba(148, 116, 59, 0.4);
    background: rgba(200, 169, 105, 0.10);
    margin-bottom: 1.75rem;
  }
  .hero h1 {
    font-family: var(--serif);
    font-size: clamp(2.6rem, 6.5vw, 4rem);
    font-weight: 500;
    line-height: 1.08;
    letter-spacing: -0.015em;
    color: var(--ink);
  }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero-rule {
    width: 64px; height: 1px; background: var(--gold);
    margin: 1.9rem 0 1.4rem;
  }
  .hero-tagline {
    font-family: var(--mono);
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--gold-deep);
    margin-bottom: 1.1rem;
  }
  .hero-sub { max-width: 30rem; font-size: 1.0625rem; }
  .hero-ctas { display: flex; flex-wrap: wrap; gap: 0.9rem; margin-top: 2.2rem; }
  .friction {
    font-family: var(--mono);
    font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--ink-3);
    margin-top: 1rem;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 0.6rem;
    font-size: 0.8125rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 0.95rem 1.5rem; border-radius: var(--radius-md);
    text-decoration: none;
    transition: opacity 150ms ease, border-color 150ms ease, color 150ms ease;
  }
  .btn .arrow { font-family: var(--sans); letter-spacing: 0; }
  .btn-primary { background: var(--ink); color: var(--cream-soft); }
  .btn-primary:hover { opacity: 0.88; }
  .btn-ghost { border: 1px solid var(--line); color: var(--ink-2); }
  .btn-ghost:hover { border-color: var(--ink-3); color: var(--ink); }
  .btn-gold { background: var(--gold); color: #1A1206; }
  .btn-gold:hover { opacity: 0.9; }

  /* Hero art — the official mark as a "notebook" cover */
  .hero-art { display: flex; justify-content: center; }
  .monogram-book {
    position: relative;
    width: min(300px, 100%); aspect-ratio: 4 / 3;
    border-radius: 8px 14px 14px 8px;
    transform: rotate(-4deg);
    overflow: hidden;
    box-shadow: 0 24px 48px -24px rgba(24, 36, 36, 0.45);
  }
  .monogram-book img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .monogram-book::before {
    content: ""; position: absolute; inset: 0 auto 0 10px; z-index: 1;
    width: 1px; background: rgba(200, 169, 105, 0.35);
  }

  /* ── Stat strip ───────────────────────────────────────────────────────── */
  .stats {
    display: flex; flex-wrap: wrap;
    border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  }
  .stat {
    flex: 1 1 0; min-width: 150px;
    display: flex; flex-direction: column; align-items: center; gap: 0.9rem;
    text-align: center; padding: 2.4rem 1rem;
    border-left: 1px solid var(--line);
  }
  .stat:first-child { border-left: none; }
  .stat svg { width: 30px; height: 30px; color: var(--ink); }
  .stat-label {
    font-family: var(--mono); font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-2);
    line-height: 1.7;
  }

  /* ── Sections ─────────────────────────────────────────────────────────── */
  section.block { padding: 5rem 0; }
  .section-head { max-width: 34rem; margin-bottom: 3rem; }
  .section-head h2 {
    font-family: var(--serif);
    font-size: clamp(1.9rem, 4vw, 2.5rem); font-weight: 500;
    letter-spacing: -0.01em; color: var(--ink);
    margin: 0.8rem 0 0.9rem;
  }
  .section-head p { color: var(--ink-2); }

  /* What syncs — the five mirrored node types as a seamless hairline grid */
  .chain {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line); border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .chain-node {
    background: var(--cream-soft);
    padding: 1.8rem 1.4rem;
    display: flex; flex-direction: column; gap: 0.55rem;
  }
  .chain-glyph {
    font-size: 1.35rem; line-height: 1;
    color: var(--gold-deep);
  }
  .chain-node h3 {
    font-family: var(--serif);
    font-size: 1.125rem; font-weight: 500; letter-spacing: -0.01em;
    color: var(--ink); line-height: 1.2;
  }
  .chain-node p { font-size: 0.8125rem; line-height: 1.55; color: var(--ink-2); }
  .chain-caption {
    font-family: var(--mono); font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--ink-3); text-align: center;
    margin-top: 1.2rem;
  }

  /* ── Two-column sections ──────────────────────────────────────────────── */
  .two-col {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
    border-top: 1px solid var(--line); padding-top: 4.5rem;
  }
  .two-col h2 {
    font-family: var(--serif); font-size: 1.6rem; font-weight: 500;
    color: var(--ink); margin: 0.8rem 0 1.5rem;
  }
  .two-col > div > p { font-size: 0.9875rem; margin-bottom: 1.5rem; }
  .checklist { list-style: none; }
  .checklist li {
    display: flex; gap: 0.85rem; align-items: flex-start;
    padding: 0.55rem 0; font-size: 0.9875rem;
  }
  .check {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; flex: none;
    border: 1px solid rgba(148, 116, 59, 0.45); border-radius: 50%;
    color: var(--gold-deep);
  }
  .check svg { width: 12px; height: 12px; }
  .checklist .check { margin-top: 0.1rem; }
  .steps { list-style: none; counter-reset: step; }
  .steps li {
    counter-increment: step;
    display: flex; gap: 1rem; align-items: flex-start;
    padding: 0.8rem 0;
  }
  .steps li::before {
    content: counter(step, decimal-leading-zero);
    font-family: var(--mono); font-size: 0.75rem; font-weight: 600;
    color: var(--gold-deep);
    border: 1px solid rgba(148, 116, 59, 0.35); border-radius: var(--radius-md);
    width: 36px; height: 36px; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .steps strong { display: block; font-weight: 600; color: var(--ink); }
  .steps span.step-sub { font-size: 0.9375rem; color: var(--ink-2); }

  /* ── Code blocks (Dataview snippet, CLI) ──────────────────────────────── */
  .code-block {
    background: var(--ink);
    color: var(--band-text);
    font-family: var(--mono);
    font-size: 0.8125rem;
    line-height: 1.7;
    border-radius: var(--radius-md);
    padding: 1.2rem 1.4rem;
    overflow-x: auto;
    white-space: pre;
  }
  .code-block .cm { color: var(--band-text-2); }
  .code-block .kw { color: var(--gold); }
  .code-caption {
    font-family: var(--mono); font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--ink-3);
    margin-top: 0.8rem;
  }

  /* ── CLI spotlight (dark verde card) ──────────────────────────────────── */
  .spotlight {
    display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 2rem; align-items: center;
    background: var(--ink); /* solid verde — the logo circle blends into it */
    border-radius: var(--radius-lg);
    padding: 3rem;
  }
  .pill-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
  .pill-gold {
    color: var(--gold); border: 1px solid rgba(200, 169, 105, 0.4);
    background: rgba(200, 169, 105, 0.10);
  }
  .pill-cream {
    color: var(--band-text-2); border: 1px solid rgba(237, 232, 218, 0.25);
  }
  .spotlight h3 {
    font-family: var(--serif);
    font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 500;
    line-height: 1.15; letter-spacing: -0.01em;
    color: var(--band-text);
  }
  .spotlight-summary { color: var(--band-text-2); margin-top: 1.1rem; max-width: 32rem; }
  .spotlight-summary code { background: rgba(237, 232, 218, 0.12); color: var(--band-text); }
  .spotlight-points { list-style: none; margin: 1.1rem 0 0; }
  .spotlight-points li {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 0.9375rem; color: var(--band-text);
    padding: 0.25rem 0;
  }
  .spotlight-points code { background: rgba(237, 232, 218, 0.12); color: var(--band-text); }
  .spotlight-points .check { border-color: rgba(200, 169, 105, 0.45); color: var(--gold); }
  .spotlight-art { display: flex; justify-content: center; }
  .spotlight-art img {
    width: 190px; height: 190px; object-fit: cover;
    border: 1px solid rgba(200, 169, 105, 0.35); border-radius: 50%;
  }

  /* ── Install — seamless grid (1px gap lines, no shadows) ──────────────── */
  .grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
    background: var(--line);
    border: 1px solid var(--line); border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .cell {
    display: flex; flex-direction: column;
    background: var(--cream-soft);
    padding: 2rem;
    text-decoration: none;
    transition: background 150ms ease;
  }
  a.cell:hover { background: #FFFDF7; }
  .cell-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem; margin-bottom: 1rem;
  }
  .pill-soon {
    font-size: 0.5625rem; padding: 0.2rem 0.55rem;
    color: var(--gold-deep); border: 1px solid rgba(148, 116, 59, 0.4);
    border-radius: 6px;
    text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;
  }
  .cell-title {
    font-family: var(--serif);
    font-size: 1.5rem; font-weight: 500; letter-spacing: -0.01em;
    color: var(--ink); line-height: 1.15;
  }
  .cell-tagline {
    font-family: var(--serif); font-style: italic;
    color: var(--gold-deep); margin-top: 0.35rem;
    font-size: 0.9875rem;
  }
  .cell-body { margin-top: 1.1rem; font-size: 0.875rem; }
  .cell-body code { display: inline-block; margin-top: 0.2rem; }
  .cell-foot {
    margin-top: auto; padding-top: 1.6rem;
    font-size: 0.875rem; font-weight: 500; color: var(--ink);
  }
  .install-note {
    font-family: var(--mono); font-size: 0.6875rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--ink-3); text-align: center;
    margin-top: 1.4rem;
  }
  .install-note a { color: var(--gold-deep); text-decoration: none; }
  .install-note a:hover { text-decoration: underline; }

  /* ── Dark band ────────────────────────────────────────────────────────── */
  .band {
    background: var(--ink);
    text-align: center;
    padding: 5rem 1.5rem;
  }
  .band-lead {
    font-family: var(--serif);
    font-size: clamp(1.3rem, 3vw, 1.7rem);
    color: var(--band-text);
    max-width: 38rem; margin: 0 auto;
  }
  .band-em {
    font-family: var(--serif); font-style: italic;
    font-size: clamp(1.15rem, 2.6vw, 1.45rem);
    color: var(--gold);
    margin-top: 0.7rem;
  }
  .band-rule {
    width: 220px; height: 1px; margin: 2.6rem auto 0;
    background: rgba(237, 232, 218, 0.25);
    position: relative;
  }
  .band-rule::after {
    content: "✦"; position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    background: var(--ink); padding: 0 0.8rem;
    color: var(--gold); font-size: 0.8rem;
  }
  .band .btn-gold { margin-top: 2.6rem; }
  .band .friction { color: var(--band-text-2); }

  /* ── Footer ───────────────────────────────────────────────────────────── */
  footer {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    padding: 2.2rem 0;
  }
  .footer-mark {
    font-family: var(--serif); font-size: 1.35rem; font-weight: 500;
    color: var(--ink); text-decoration: none;
  }
  .footer-mark span { color: var(--gold); font-size: 0.55em; vertical-align: 0.9em; }
  footer nav { display: flex; gap: 1.6rem; }
  footer nav a {
    font-size: 0.8125rem; color: var(--ink-2); text-decoration: none;
  }
  footer nav a:hover { color: var(--ink); }
  .footer-copy { font-size: 0.8125rem; color: var(--ink-3); }

  /* ── Responsive ───────────────────────────────────────────────────────── */
  @media (max-width: 880px) {
    .hero { grid-template-columns: 1fr; gap: 2.5rem; padding: 3.5rem 0 4rem; }
    .hero-art { display: none; }
    .chain { grid-template-columns: 1fr; }
    .spotlight { grid-template-columns: 1fr; padding: 2.2rem 1.6rem; }
    .spotlight-art { display: none; }
    .grid { grid-template-columns: 1fr; }
    .two-col { grid-template-columns: 1fr; gap: 3rem; }
    .stat { min-width: 33%; border-left: none; }
  }
  @media (max-width: 520px) {
    .masthead { padding-top: 2.2rem; }
    section.block { padding: 3.5rem 0; }
    .hero-ctas { flex-direction: column; align-items: stretch; }
    .btn { justify-content: center; }
    .cell { padding: 1.6rem 1.3rem; }
    .stat { min-width: 50%; padding: 1.8rem 0.5rem; }
    footer { flex-direction: column; text-align: center; }
  }
</style>
</head>
<body>

<header class="masthead">
  <img class="masthead-mark" src="/static/alissa-marfil.jpeg" alt="Alissa" width="120" height="120">
  <a class="wordmark" href="/">Alissa<span class="spark">✦</span></a>
  <div class="wordmark-sub">Sync</div>
  <div class="spark-divider">✦</div>
</header>

<main>
  <div class="container">

    <section class="hero">
      <div>
        <span class="pill">✦ Obsidian plugin</span>
        <h1>Your Alissa workspace, inside <em>Obsidian</em>.</h1>
        <div class="hero-rule"></div>
        <p class="hero-tagline">Wikilinked &middot; Live Mirror &middot; Real Markdown</p>
        <p class="hero-sub">Alissa Sync mirrors your projects, tasks, context docs, deliverables, and entities into your vault as real markdown — and because every relationship is a wikilink, your task dependency trees and project hierarchies render in Obsidian's graph view.</p>
        <div class="hero-ctas">
          <a class="btn btn-gold" href="#install">Install Alissa Sync <span class="arrow">→</span></a>
          <a class="btn btn-ghost" href="${esc(studioUrl)}">Get an Alissa account</a>
        </div>
        <p class="friction">Free plugin &middot; One-way mirror &middot; Your vault stays yours</p>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="monogram-book"><img src="/static/alissa-verde.jpeg" alt=""></div>
      </div>
    </section>

    <section class="stats" aria-label="Alissa Sync highlights">
      ${stats
        .map(
          (s) => `<div class="stat">${s.icon}<span class="stat-label">${s.label}</span></div>`,
        )
        .join("\n      ")}
    </section>

    <section class="block">
      <div class="section-head">
        <span class="overline">The graph</span>
        <h2>Open the graph view. Your work is already a graph.</h2>
        <p>In Alissa, tasks depend on tasks, roll up into bodies of work, milestones, and projects, and reference the entities they touch. Alissa Sync writes every one of those relationships as a wikilink — so Obsidian's graph view draws your dependency trees and project hierarchies for you, and backlinks work on every note.</p>
      </div>
      <div class="chain">
        ${chain
          .map(
            (n) => `<div class="chain-node"><span class="chain-glyph" aria-hidden="true">${n.glyph}</span><h3>${esc(n.name)}</h3><p>${esc(n.blurb)}</p></div>`,
          )
          .join("\n        ")}
      </div>
      <p class="chain-caption">Projects &middot; Tasks &middot; Context docs &middot; Deliverables &middot; Entities — every relationship is a wikilink</p>
    </section>

    <section class="block" style="padding-top: 0;">
      <div class="two-col">
        <div>
          <span class="overline">Built for Dataview</span>
          <h2>Frontmatter that queries well.</h2>
          <p>Every mirrored note carries clean YAML frontmatter — <code>status</code>, <code>type</code>, and <code>aliases</code> — so Dataview treats your Alissa workspace like a database. One snippet and you have a live task board in a note:</p>
          <div class="code-block"><span class="cm">\`\`\`dataview</span>
<span class="kw">TABLE</span> status
<span class="kw">FROM</span> "Alissa"
<span class="kw">WHERE</span> type = "task" AND status != "resolved"
<span class="kw">SORT</span> status <span class="kw">ASC</span>
<span class="cm">\`\`\`</span></div>
          <p class="code-caption">Open tasks, live, in any note of your vault</p>
        </div>
        <div>
          <span class="overline">Setup</span>
          <h2>Four steps in.</h2>
          <ol class="steps">
            <li><div><strong>Install the plugin</strong><span class="step-sub">Community plugins or BRAT — see below.</span></div></li>
            <li><div><strong>Paste your API token</strong><span class="step-sub">From your <a href="${esc(studioUrl)}">Alissa Studio</a> account settings.</span></div></li>
            <li><div><strong>Pick a subfolder</strong><span class="step-sub">The mirror lives in its own folder (default <code>Alissa/</code>) — the rest of your vault is never touched.</span></div></li>
            <li><div><strong>Click sync</strong><span class="step-sub">The ribbon button refreshes the mirror whenever you want it.</span></div></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="block" style="padding-top: 0;">
      <div class="two-col">
        <div>
          <span class="overline">How sync behaves</span>
          <h2>Incremental, and honest about it.</h2>
          <p>Each sync compares your workspace against the mirror and reports exactly what happened — files <strong>written</strong>, <strong>unchanged</strong>, <strong>moved</strong>, or <strong>deleted</strong>. Unchanged notes aren't rewritten, so syncs are fast and your vault history stays quiet.</p>
          <ul class="checklist">
            <li><span class="check">${ICONS.check}</span>Only changed files are written — renames become moves, not duplicates.</li>
            <li><span class="check">${ICONS.check}</span>Notes that left your workspace are removed from the mirror.</li>
            <li><span class="check">${ICONS.check}</span>A per-sync summary tells you exactly what changed.</li>
          </ul>
        </div>
        <div>
          <span class="overline">The mirror contract</span>
          <h2>Read-only, by design.</h2>
          <p>The mirror is one-way: Alissa is the source of truth, and the next sync overwrites local edits inside the mirror folder. That's the feature — the mirror is always trustworthy.</p>
          <ul class="checklist">
            <li><span class="check">${ICONS.check}</span>Think in <em>your</em> notes — they're never touched.</li>
            <li><span class="check">${ICONS.check}</span>Link into the mirror with wikilinks; backlinks connect your thinking to your work.</li>
            <li><span class="check">${ICONS.check}</span>Change the work in <a href="${esc(studioUrl)}">Alissa Studio</a>, then sync — the mirror follows.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="block" style="padding-top: 0;">
      <div class="spotlight">
        <div>
          <div class="pill-row">
            <span class="pill pill-gold">✦ CLI</span>
            <span class="pill pill-cream">Automation + Agents</span>
          </div>
          <h3>The same mirror, from your terminal.</h3>
          <p class="spotlight-summary">Prefer scripts over ribbon buttons? <code>alissa vault export</code> materializes the same wikilinked vault from the Alissa CLI — point it at your Obsidian folder and put it on a schedule.</p>
          <ul class="spotlight-points">
            <li><span class="check">${ICONS.check}</span><code>alissa vault export</code> — the mirror as a command</li>
            <li><span class="check">${ICONS.check}</span>Incremental, scriptable, cron-friendly</li>
            <li><span class="check">${ICONS.check}</span><code>--format okf</code> — an Open Knowledge Format bundle your agents can read</li>
          </ul>
        </div>
        <div class="spotlight-art" aria-hidden="true">
          <img src="/static/alissa-verde.jpeg" alt="" loading="lazy" width="190" height="190">
        </div>
      </div>
    </section>

    <section id="install" class="block" style="padding-top: 0;">
      <div class="section-head">
        <span class="overline">Install</span>
        <h2>Two ways in. One token.</h2>
        <p>The plugin is free and open source. You'll need an Alissa account for the API token — free to create.</p>
      </div>
      <div class="grid">
        <div class="cell">
          <div class="cell-top"><span class="overline">Community plugins</span><span class="pill-soon">Coming soon</span></div>
          <div class="cell-title">Search "Alissa Sync"</div>
          <p class="cell-tagline">The one-click path.</p>
          <p class="cell-body">Once approved, install it straight from Obsidian: Settings → Community plugins → Browse → <strong>Alissa Sync</strong>.</p>
          <div class="cell-foot">Pending review — use BRAT meanwhile</div>
        </div>
        <a class="cell" href="${esc(repoUrl)}">
          <div class="cell-top"><span class="overline">BRAT</span></div>
          <div class="cell-title">Beta, today</div>
          <p class="cell-tagline">For the impatient (affectionate).</p>
          <p class="cell-body">Add the repo in the BRAT plugin:<br><code>fahera-mx/obsidian.alissa.app</code></p>
          <div class="cell-foot">View on GitHub ›</div>
        </a>
        <a class="cell" href="${esc(studioUrl)}">
          <div class="cell-top"><span class="overline">API token</span></div>
          <div class="cell-title">Get your account</div>
          <p class="cell-tagline">The key to the mirror.</p>
          <p class="cell-body">Create a free Alissa account, generate an API token in settings, and paste it into the plugin.</p>
          <div class="cell-foot">Open Alissa Studio ›</div>
        </a>
      </div>
      <p class="install-note">Free &middot; open source &middot; <a href="${esc(repoUrl)}">github.com/fahera-mx/obsidian.alissa.app</a></p>
    </section>

  </div>

  <section class="band">
    <p class="band-lead">Your second brain, meet your system of work.</p>
    <p class="band-em">Think in your notes. Link into the mirror.</p>
    <div class="band-rule"></div>
    <a class="btn btn-gold" href="#install">Install Alissa Sync <span class="arrow">→</span></a>
    <p class="friction">Free plugin &middot; Token from studio.alissa.app</p>
  </section>

  <div class="container">
    <footer>
      <a class="footer-mark" href="${esc(studioUrl)}">Alissa<span>✦</span></a>
      <nav>
        <a href="${esc(studioUrl)}">Studio</a>
        <a href="${esc(repoUrl)}">GitHub</a>
        <a href="https://academy.alissa.app">Academy</a>
        <a href="https://legal.alissa.app">Legal</a>
      </nav>
      <span class="footer-copy">© ${new Date().getFullYear()} Alissa</span>
    </footer>
  </div>
</main>

</body>
</html>`;
}
