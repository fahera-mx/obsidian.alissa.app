# Alissa Sync landing — obsidian.alissa.app

The marketing page for the [Alissa Sync](../) Obsidian plugin, deployed at
[obsidian.alissa.app](https://obsidian.alissa.app). A small Express + TypeScript
server that renders a static, zero-JS page once at startup (`src/lib/page.ts`)
and serves it with the brand assets in `static/`. Build and run with
`npm install && npm run build && npm start` (or `npm run dev` for a watch
server); it listens on `PORT` (default 3005).
