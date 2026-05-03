import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import type { StorageData } from "../type";

const FILE_NAME = "seeker.json";

const DEFAULT_DATA: StorageData = {
  trackup: {
    tasks: [],
    currentTaskId: null,
  },
  buildup: {
    today: null,
    history: [],
  },
};

export async function loadData() {
  try {
    const fileExists = await exists(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!fileExists) {
      return DEFAULT_DATA;
    }

    const content = await readTextFile(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData,
    });

    const parsed = JSON.parse(content) as Partial<StorageData> & {
      today?: StorageData["buildup"]["today"];
      history?: StorageData["buildup"]["history"];
    };

    const merged: StorageData = {
      ...DEFAULT_DATA,
      ...parsed,
      trackup: {
        ...DEFAULT_DATA.trackup,
        ...parsed.trackup,
      },
      buildup: {
        ...DEFAULT_DATA.buildup,
        ...parsed.buildup,
      },
    };

    // Legacy single-file shape (today at root)
    if (!parsed.trackup && parsed.today !== undefined) {
      merged.buildup.today = parsed.today ?? null;
      merged.buildup.history = parsed.history ?? [];
    }

    if (!merged.trackup) {
      merged.trackup = { ...DEFAULT_DATA.trackup };
    }
    if (merged.trackup.currentTaskId === undefined) {
      merged.trackup.currentTaskId = null;
    }

    return merged;
  } catch (error) {
    console.error("Failed to load data:", error);
    return DEFAULT_DATA;
  }
}

export async function saveData(data: StorageData) {
  await writeTextFile(FILE_NAME, JSON.stringify(data, null, 2), {
    baseDir: BaseDirectory.AppLocalData,
  });
}
