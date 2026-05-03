import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import type { SettingsData } from "../type";

const FILE_NAME = "settings.json";
const DEFAULT_SETTINGS: SettingsData = {
  mode: null,
  showViewHints: true,
};

export async function loadSettings() {
  try {
    const fileExists = await exists(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!fileExists) {
      return DEFAULT_SETTINGS;
    }

    const content = await readTextFile(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData,
    });

    const parsed = JSON.parse(content) as Partial<SettingsData>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error("Failed to load settings: ", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: SettingsData) {
  try {
    await writeTextFile(FILE_NAME, JSON.stringify(settings, null, 2), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch (error) {
    console.error("Failed to save settings: ", error);
  }
}
