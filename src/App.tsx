import { useCallback, useEffect, useState } from "react";
import { playClickSound } from "./shared/utils/clickSound";
import { loadSettings, saveSettings } from "./shared/utils/settings";
import Nav from "./components/Nav";
import DashboardPage from "./pages/DashboardPage";
import WelcomePage from "./pages/WelcomePage";
import SettingsPage from "./pages/SettingsPage";
import TaskListPage from "./pages/TaskListPage";
import type { SettingsData } from "./shared/type";
import { loadData } from "./shared/utils/storage";
import { ViewHintsProvider } from "./context/ViewHintsContext";

function App() {
  const [page, setPage] = useState("main");
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [mode, setMode] = useState<SettingsData["mode"]>(null);
  const [showViewHints, setShowViewHints] = useState(true);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const setViewHintsEnabled = useCallback(async (next: boolean) => {
    setShowViewHints(next);
    const current = await loadSettings();
    await saveSettings({ ...current, showViewHints: next });
  }, []);

  const handleModeSelected = useCallback((mode: "trackup" | "buildup") => {
    setMode(mode);
    setIsFirstVisit(false);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      const settings = await loadSettings();
      setIsFirstVisit(settings.mode === null);
      setMode(settings.mode);
      setShowViewHints(settings.showViewHints);
    }
    async function fetchCurrentTask() {
      const data = await loadData();
      setCurrentTaskId(data.trackup.currentTaskId ?? null);
    }

    fetchSettings();
    fetchCurrentTask();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const shiftKey = e.shiftKey;
      const escapeKey = e.key === "Escape" || e.key === "Esc";
      const sKey = e.key === "S";
      const activeElement = document.activeElement as HTMLElement | null;
      const isTypingField =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable === true;

      if (shiftKey && escapeKey) {
        setPage("task-list");
        playClickSound();
      }

      if (shiftKey && sKey) {
        if (isTypingField) return;
        setPage("settings");
        playClickSound();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isFirstVisit) {
    return <WelcomePage onModeSelected={handleModeSelected} />;
  }

  return (
    <ViewHintsProvider value={{ enabled: showViewHints, setEnabled: setViewHintsEnabled }}>
      <div className="flex h-screen flex-col">
        <Nav page={page} setPage={setPage} />
        <main className="flex flex-1 min-h-0 flex-col">
          {page === "task-list" ? (
            <TaskListPage changePage={setPage} mode={mode} setCurrentTaskId={setCurrentTaskId} />
          ) : page === "settings" ? (
            <SettingsPage />
          ) : (
            <DashboardPage mode={mode} currentTaskId={currentTaskId} />
          )}
        </main>
      </div>
    </ViewHintsProvider>
  );
}

export default App;
