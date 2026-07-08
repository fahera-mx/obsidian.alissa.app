# Alissa Sync — Obsidian plugin

Mirror your [Alissa](https://studio.alissa.app) vault into Obsidian: projects,
tasks, context, deliverables and entities as wikilinked markdown — your whole
knowledge graph, refreshed with one click.

**Website & guide:** https://obsidian.alissa.app (source under [`landing/`](landing/))

## Install

- **Community plugins** (once approved): search for "Alissa Sync".
- **BRAT (beta)**: add `fahera-mx/obsidian.alissa.app` in the BRAT plugin.
- **Manual**: download `manifest.json` + `main.js` from the latest release into
  `<vault>/.obsidian/plugins/alissa-sync/` and enable it.

Then open the plugin settings, paste your Alissa API token, pick a target
subfolder (default `Alissa/`), and hit the ribbon button.

## Privacy

Your token is stored locally in the plugin data and never logged. The plugin
talks only to the configured Alissa API base (default `api.alissa.app`) over
HTTPS to fetch YOUR vault content; nothing else leaves your machine.

## Development

```bash
npm install
npm run dev    # watch build → main.js
npm run build  # typecheck + production build
```

The plugin source of truth lives in the (private) Alissa monorepo and is
synced here; PRs are welcome for the landing page, and issues for everything.
