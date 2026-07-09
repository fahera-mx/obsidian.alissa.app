import { Notice, Plugin, PluginSettingTab, Setting, App } from "obsidian";
import { AlissaApi, AlissaAuthError } from "./client";
import { syncVault, type SyncManifest } from "./sync";

// =============================================================================
// Alissa Sync — Obsidian community plugin (TASK-1980129108).
//
// One-way mirror of the user's Alissa vault into a configurable subfolder:
// same pipeline as `alissa vault export --format obsidian --incremental`,
// driven from a ribbon button / command / optional auto-sync interval.
// =============================================================================

interface AlissaSyncSettings {
  apiBase: string;
  /** Alissa API token — same token the CLI uses (`alissa auth login`). */
  token: string;
  targetFolder: string;
  /** 0 = manual only. */
  autoSyncMinutes: number;
}

const DEFAULT_SETTINGS: AlissaSyncSettings = {
  apiBase: "https://api.alissa.app",
  token: "",
  targetFolder: "Alissa",
  autoSyncMinutes: 0,
};

interface PersistedData {
  settings: AlissaSyncSettings;
  manifest: SyncManifest;
}

export default class AlissaSyncPlugin extends Plugin {
  settings: AlissaSyncSettings = { ...DEFAULT_SETTINGS };
  private syncManifest: SyncManifest = {};
  private statusBar: HTMLElement | null = null;
  private syncing = false;
  private intervalId: number | null = null;

  // Plugin.onload is typed void — do the async work in initialize() instead
  // of an async override (directory-review lint: no promise where the base
  // type expects void).
  onload(): void {
    this.initialize().catch((err: unknown) => {
      new Notice(`Alissa Sync failed to initialize: ${(err as Error).message}`, 8_000);
    });
  }

  private async initialize(): Promise<void> {
    await this.loadPersisted();

    this.addRibbonIcon("refresh-cw", "Sync Alissa vault", () => void this.runSync());
    this.addCommand({
      id: "sync",
      name: "Sync now",
      callback: () => void this.runSync(),
    });
    this.addCommand({
      id: "full-resync",
      name: "Full re-sync (rewrite everything)",
      callback: () => void this.runSync({ full: true }),
    });
    this.statusBar = this.addStatusBarItem();
    this.setStatus("Alissa: idle");
    this.addSettingTab(new AlissaSyncSettingTab(this.app, this));
    this.applyAutoSync();
  }

  onunload(): void {
    if (this.intervalId != null) window.clearInterval(this.intervalId);
  }

  applyAutoSync(): void {
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.settings.autoSyncMinutes > 0) {
      this.intervalId = window.setInterval(
        () => void this.runSync({ quiet: true }),
        this.settings.autoSyncMinutes * 60_000,
      );
      this.registerInterval(this.intervalId);
    }
  }

  private setStatus(text: string): void {
    this.statusBar?.setText(text);
  }

  async runSync(opts: { full?: boolean; quiet?: boolean } = {}): Promise<void> {
    if (this.syncing) {
      if (!opts.quiet) new Notice("Alissa sync already running.");
      return;
    }
    if (!this.settings.token) {
      new Notice("Alissa Sync: set your API token in the plugin settings first.");
      return;
    }
    this.syncing = true;
    this.setStatus("Alissa: syncing…");
    try {
      const api = new AlissaApi(this.settings.apiBase.replace(/\/+$/u, ""), this.settings.token);
      const { summary, manifest } = await syncVault({
        vault: this.app.vault,
        api,
        targetFolder: this.settings.targetFolder,
        incremental: !opts.full,
        previousManifest: this.syncManifest,
        onPhase: (phase, count) => this.setStatus(`Alissa: ${phase} (${count})`),
      });
      this.syncManifest = manifest;
      await this.savePersisted();
      const text = `Alissa: ${summary.docs} notes — ${summary.written} written, ${summary.unchanged} unchanged, ${summary.moved} moved, ${summary.deleted} deleted`;
      this.setStatus(`Alissa: synced ${new Date().toLocaleTimeString()}`);
      if (!opts.quiet || summary.written + summary.moved + summary.deleted > 0) new Notice(text);
    } catch (err) {
      this.setStatus("Alissa: sync failed");
      const message = err instanceof AlissaAuthError ? err.message : `Alissa sync failed: ${(err as Error).message}`;
      new Notice(message, 8_000);
    } finally {
      this.syncing = false;
    }
  }

  private async loadPersisted(): Promise<void> {
    const data = (await this.loadData()) as Partial<PersistedData> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(data?.settings ?? {}) };
    this.syncManifest = data?.manifest ?? {};
  }

  async savePersisted(): Promise<void> {
    const data: PersistedData = { settings: this.settings, manifest: this.syncManifest };
    await this.saveData(data);
  }
}

class AlissaSyncSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: AlissaSyncPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("API token")
      .setDesc("Your Alissa API token — the same one the CLI uses. It is stored locally in the plugin data and never logged.")
      .addText((text) => {
        text.inputEl.type = "password";
        text.setPlaceholder("alissa_…")
          .setValue(this.plugin.settings.token)
          .onChange(async (value) => {
            this.plugin.settings.token = value.trim();
            await this.plugin.savePersisted();
          });
      });

    new Setting(containerEl)
      .setName("Target folder")
      .setDesc("Vault subfolder that holds the Alissa mirror. Treat it as read-only — the next sync overwrites local edits.")
      .addText((text) =>
        text.setPlaceholder("Alissa")
          .setValue(this.plugin.settings.targetFolder)
          .onChange(async (value) => {
            this.plugin.settings.targetFolder = value.trim() || "Alissa";
            await this.plugin.savePersisted();
          }),
      );

    new Setting(containerEl)
      .setName("Auto-sync interval (minutes)")
      .setDesc("0 disables auto-sync (use the ribbon button or command).")
      .addText((text) =>
        text.setPlaceholder("0")
          .setValue(String(this.plugin.settings.autoSyncMinutes))
          .onChange(async (value) => {
            const n = Number.parseInt(value, 10);
            this.plugin.settings.autoSyncMinutes = Number.isFinite(n) && n > 0 ? Math.min(n, 24 * 60) : 0;
            await this.plugin.savePersisted();
            this.plugin.applyAutoSync();
          }),
      );

    new Setting(containerEl)
      .setName("API base URL")
      .setDesc("Only change this if you run a self-hosted Alissa API.")
      .addText((text) =>
        text.setPlaceholder("https://api.alissa.app")
          .setValue(this.plugin.settings.apiBase)
          .onChange(async (value) => {
            this.plugin.settings.apiBase = value.trim() || DEFAULT_SETTINGS.apiBase;
            await this.plugin.savePersisted();
          }),
      );
  }
}
