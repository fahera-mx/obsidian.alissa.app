// =============================================================================
// OG CARD GENERATOR — static/og.png (1200×630)
//
// Alissa's editorial verde world meets Obsidian's purple crystal world.
// Left: verde field, gold eyebrow, Fraunces marfil headline, Inter subline.
// Right: a stylized faceted crystal (own-drawn SVG polygons — NOT the official
// Obsidian mark) glowing purple against a darkened blend of the verde field.
//
// Runs at build time (npm run og) — @resvg/resvg-js is a devDependency, so the
// server Docker image stays slim; the PNG is committed under static/.
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FONTS = path.join(ROOT, "assets", "fonts");
const OUT = path.join(ROOT, "static", "og.png");

const W = 1200;
const H = 630;

// Official brand colors — sampled from the logo files (see src/lib/page.ts).
const VERDE = "#182424";
const MARFIL = "#F4ECE1";
const GOLD = "#C8A969";
const MUTED = "#B9C2BB";

// Obsidian-adjacent purple range for the crystal (own palette, own drawing).
const P_HI = "#9974F8";
const P_MID = "#6C31E3";
const P_DEEP = "#4B1FA6";

// The Alissa mark — its JPEG background is VERDE, so it blends into the field.
const markB64 = readFileSync(path.join(ROOT, "static", "alissa-verde.jpeg")).toString("base64");

/** Uppercase + spaced eyebrow text (SVG letter-spacing handles the tracking). */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ── The crystal ──────────────────────────────────────────────────────────────
// A classic elongated gem: flat table, faceted crown, deep pavilion point —
// plus two satellite shards. Drawn from scratch as polygons.

function crystal(cx, cy) {
  // Silhouette anchor points (main gem).
  const tL = [cx - 62, cy - 138]; // table left
  const tR = [cx + 62, cy - 138]; // table right
  const gL = [cx - 148, cy - 42]; // girdle left
  const gR = [cx + 148, cy - 42]; // girdle right
  const mL = [cx - 88, cy - 42]; // girdle inner-left
  const mR = [cx + 88, cy - 42]; // girdle inner-right
  const tip = [cx, cy + 208]; // pavilion tip

  const pts = (arr) => arr.map((p) => p.join(",")).join(" ");

  return `
  <!-- glow -->
  <circle cx="${cx}" cy="${cy}" r="300" fill="url(#glow)"/>

  <!-- satellite shard, back-left (tucked low so it clears the headline) -->
  <g opacity="0.7">
    <polygon points="${pts([[cx - 196, cy + 96], [cx - 158, cy + 30], [cx - 128, cy + 92], [cx - 162, cy + 206]])}" fill="url(#facetDeep)"/>
    <polygon points="${pts([[cx - 196, cy + 96], [cx - 158, cy + 30], [cx - 176, cy + 106]])}" fill="url(#facetMid)"/>
  </g>

  <!-- satellite shard, front-right -->
  <g opacity="0.9">
    <polygon points="${pts([[cx + 148, cy + 78], [cx + 196, cy + 22], [cx + 226, cy + 92], [cx + 182, cy + 176]])}" fill="url(#facetMid)"/>
    <polygon points="${pts([[cx + 196, cy + 22], [cx + 226, cy + 92], [cx + 206, cy + 60]])}" fill="url(#facetHi)"/>
  </g>

  <!-- main gem: crown -->
  <polygon points="${pts([tL, tR, mR, mL])}" fill="url(#facetTable)"/>
  <polygon points="${pts([tL, mL, gL])}" fill="url(#facetMid)"/>
  <polygon points="${pts([tR, gR, mR])}" fill="url(#facetHi)"/>

  <!-- main gem: pavilion -->
  <polygon points="${pts([mL, mR, tip])}" fill="url(#facetPavilion)"/>
  <polygon points="${pts([gL, mL, tip])}" fill="url(#facetDeep)"/>
  <polygon points="${pts([mR, gR, tip])}" fill="url(#facetMidDeep)"/>

  <!-- table split facet — breaks up the flat crown -->
  <polygon points="${pts([[cx, cy - 138], tR, mR, [cx + 4, cy - 42]])}" fill="${P_HI}" opacity="0.25"/>

  <!-- facet edge lines -->
  <g stroke="#C9B4FB" stroke-opacity="0.35" stroke-width="1.5" fill="none">
    <polyline points="${pts([gL, tL, tR, gR])}"/>
    <line x1="${gL[0]}" y1="${gL[1]}" x2="${gR[0]}" y2="${gR[1]}"/>
    <polyline points="${pts([gL, tip, gR])}"/>
    <line x1="${mL[0]}" y1="${mL[1]}" x2="${tip[0]}" y2="${tip[1]}"/>
    <line x1="${mR[0]}" y1="${mR[1]}" x2="${tip[0]}" y2="${tip[1]}"/>
    <line x1="${cx}" y1="${cy - 138}" x2="${cx + 4}" y2="${cy - 42}"/>
  </g>

  <!-- ground reflection -->
  <ellipse cx="${cx}" cy="${cy + 238}" rx="140" ry="14" fill="${P_DEEP}" opacity="0.28" filter="url(#soften)"/>

  <!-- glints -->
  <polygon points="${pts([[cx - 30, cy - 122], [cx + 8, cy - 122], [cx - 14, cy - 96]])}" fill="#E4D8FE" opacity="0.7"/>
  <line x1="${cx - 52}" y1="${cy + 34}" x2="${cx - 20}" y2="${cy + 96}" stroke="#DCCBFD" stroke-opacity="0.4" stroke-width="2"/>

  <!-- gold sparkles: Alissa's ✦ visiting the purple world -->
  <g fill="${GOLD}">
    <path d="M ${cx - 190} ${cy - 148} q 2.4 12.6 15 15 q -12.6 2.4 -15 15 q -2.4 -12.6 -15 -15 q 12.6 -2.4 15 -15 Z"/>
    <path d="M ${cx + 205} ${cy - 60} q 1.6 8.4 10 10 q -8.4 1.6 -10 10 q -1.6 -8.4 -10 -10 q 8.4 -1.6 10 -10 Z" opacity="0.85"/>
    <path d="M ${cx + 60} ${cy + 220} q 1.2 6.3 7.5 7.5 q -6.3 1.2 -7.5 7.5 q -1.2 -6.3 -7.5 -7.5 q 6.3 -1.2 7.5 -7.5 Z" opacity="0.7"/>
  </g>`;
}

// ── Card composition ─────────────────────────────────────────────────────────

function buildSvg() {
  const x = 84; // left text margin (mirrors studio card)
  const eyebrow = "ALISSA SYNC · FOR OBSIDIAN";
  const headline1 = "Your Alissa workspace,";
  const headline2 = "inside Obsidian.";
  const sub1 = "A wikilinked markdown mirror of your projects and";
  const sub2 = "tasks — dependency trees light up your graph view.";

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- right side darkens toward the purple world -->
    <linearGradient id="field" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${VERDE}"/>
      <stop offset="0.55" stop-color="${VERDE}"/>
      <stop offset="1" stop-color="#131022"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P_MID}" stop-opacity="0.38"/>
      <stop offset="0.55" stop-color="${P_DEEP}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${P_DEEP}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="facetTable" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#B296FA"/>
      <stop offset="1" stop-color="${P_HI}"/>
    </linearGradient>
    <linearGradient id="facetHi" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P_HI}"/>
      <stop offset="1" stop-color="${P_MID}"/>
    </linearGradient>
    <linearGradient id="facetMid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8659EF"/>
      <stop offset="1" stop-color="${P_MID}"/>
    </linearGradient>
    <linearGradient id="facetMidDeep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P_MID}"/>
      <stop offset="1" stop-color="${P_DEEP}"/>
    </linearGradient>
    <linearGradient id="facetPavilion" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7A46E9"/>
      <stop offset="0.6" stop-color="#5A28C4"/>
      <stop offset="1" stop-color="${P_DEEP}"/>
    </linearGradient>
    <linearGradient id="facetDeep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5F2BD0"/>
      <stop offset="1" stop-color="#3B1885"/>
    </linearGradient>
    <filter id="soften" x="-50%" y="-200%" width="200%" height="500%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <!-- field -->
  <rect width="${W}" height="${H}" fill="url(#field)"/>

  <!-- crystal, right ~40% -->
  ${crystal(945, 300)}

  <!-- Alissa mark — JPEG background is verde, blends into the field -->
  <image href="data:image/jpeg;base64,${markB64}" x="${x - 18}" y="26" width="124" height="124"/>

  <!-- eyebrow -->
  <text x="${x}" y="196" font-family="Inter" font-weight="600" font-size="21" letter-spacing="4.5" fill="${GOLD}">${esc(eyebrow)}</text>

  <!-- headline -->
  <text x="${x}" y="286" font-family="Fraunces" font-size="66" fill="${MARFIL}">${esc(headline1)}</text>
  <text x="${x}" y="366" font-family="Fraunces" font-size="66" fill="${MARFIL}">${esc(headline2)}</text>

  <!-- subline -->
  <text x="${x}" y="432" font-family="Inter" font-size="26" fill="${MUTED}">${esc(sub1)}</text>
  <text x="${x}" y="470" font-family="Inter" font-size="26" fill="${MUTED}">${esc(sub2)}</text>

  <!-- url, bottom-left -->
  <text x="${x}" y="${H - 56}" font-family="Inter" font-weight="600" font-size="23" fill="${GOLD}" fill-opacity="0.9">obsidian.alissa.app</text>
</svg>`;
}

// ── Render ───────────────────────────────────────────────────────────────────

const svg = buildSvg();
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: {
    loadSystemFonts: false,
    fontFiles: [
      path.join(FONTS, "Fraunces-Medium.ttf"),
      path.join(FONTS, "Inter-Regular.ttf"),
      path.join(FONTS, "Inter-SemiBold.ttf"),
    ],
    defaultFontFamily: "Inter",
  },
});
const png = resvg.render().asPng();
writeFileSync(OUT, png);
console.log(`✦ wrote ${path.relative(ROOT, OUT)} (${(png.length / 1024).toFixed(1)} KB)`);
