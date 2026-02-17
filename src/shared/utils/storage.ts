import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";
import type { StorageData } from "../type";

const FILE_NAME = "bbox.json";
const DEFAULT_DATA: StorageData = {
  today: null,
  history: []
}

export async function loadData() {
  try{
    const fileExists = await exists(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData
    });
    
    if(!fileExists){
      return DEFAULT_DATA;
    }

    const content = await readTextFile(FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData
    });

    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to load data:", error);
    return DEFAULT_DATA;
  }
}

export async function saveData(data: StorageData) {
  await writeTextFile(FILE_NAME, JSON.stringify(data, null, 2), { 
    baseDir: BaseDirectory.AppLocalData
  });
}