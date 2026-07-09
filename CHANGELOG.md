# Changelog

All notable changes to the Alissa Sync plugin. This file is the RELEASE
CONTRACT: bumping `manifest.json`'s version requires a matching `## <version>`
entry here — the sync workflow refuses to ship a bump without one, and on
merge it auto-tags the public repo, whose release workflow publishes the
GitHub release using this entry as the release notes.

## 0.1.5 — 2026-07-09

- Release assets now ship with GitHub artifact attestations (Sigstore build
  provenance): verify that `main.js` was built from this repository with
  `gh attestation verify main.js -R fahera-mx/obsidian.alissa.app`.

## 0.1.4 — 2026-07-09

- Releases are now fully automated: a version bump merged to main auto-tags
  the public repo, and this changelog entry becomes the release notes.
- Landing page moved out of the distribution repo (plugin-only scorecard).

## 0.1.3 — 2026-07-09

- Community-directory scorecard fixes: `window.setTimeout` for popout-window
  compatibility, `void`-typed `onload` with initialization failures surfaced
  as a Notice, `builtin-modules` dependency replaced with Node's own
  `builtinModules`.

## 0.1.2 — 2026-07-09

- Manifest description reworded for the community-directory submission.

## 0.1.1 — 2026-07-08

- Graph fidelity: notes are named by entity title instead of `info.md`, so
  Obsidian's graph shows real titles; existing vaults convert via
  rename-as-move on the next sync.
- New link fabric: observables link their subject, entity instances link
  referenced instances and their originating task/project/body of work.

## 0.1.0 — 2026-07-08

- Initial release: one-way mirror of your Alissa vault (projects, tasks,
  context, deliverables, entities) as wikilinked markdown; incremental sync
  (written/unchanged/moved/deleted), ribbon + commands + status bar,
  auto-sync interval, mobile support.
