import { useCallback, useEffect, useState, useRef } from "react";
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
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string | null>(null);
  const pageArray = ["task-list", "main", "settings"];

  const pageRef = useRef(page);
  const isFirstVisitRef = useRef(isFirstVisit);
  const currentTaskTitleRef = useRef(currentTaskTitle);
  const currentTaskIdRef = useRef(currentTaskId);
  pageRef.current = page;
  isFirstVisitRef.current = isFirstVisit;
  currentTaskTitleRef.current = currentTaskTitle;
  currentTaskIdRef.current = currentTaskId;

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
    if(isFirstVisitRef.current) return;
    if(pageRef.current != "main") return;
    
    async function setMainPageTitle() {
      const data = await loadData();
      const currentTask = (data.trackup.tasks??[]).find((task) => task.id === currentTaskIdRef.current);

      if(currentTask) {
        setCurrentTaskTitle(currentTask.title);
      }
    }

    setMainPageTitle();
  }, [page, currentTaskId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      const escapeKey = e.key === "Escape" || e.key === "Esc";
      const lKey = e.key === "l";
      const hKey = e.key === "h";
      const leftKey = e.key === "ArrowLeft";
      const rightKey = e.key === "ArrowRight";

      if (mod && (lKey || rightKey)) {
        e.preventDefault();
        const index = pageArray.indexOf(pageRef.current);
        const safeIndex = index === -1 ? pageArray.indexOf("main") : index;
        const newIndex = safeIndex === pageArray.length - 1 ? 0 : safeIndex + 1;
        setPage(pageArray[newIndex]);
        playClickSound();
        return;
      }

      if (mod && (hKey || leftKey)) {
        e.preventDefault();
        const index = pageArray.indexOf(pageRef.current);
        const safeIndex = index === -1 ? pageArray.indexOf("main") : index;
        const newIndex = safeIndex === 0 ? pageArray.length - 1 : safeIndex - 1;
        setPage(pageArray[newIndex]);
        playClickSound();
        return;
      }

      if (mod && escapeKey) {
        setPage("task-list");
        playClickSound();
      }

      if (mod && e.key === ".") {
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
        <Nav navTitle={page === "main" ? currentTaskTitleRef.current ?? "main" : page} page={pageRef.current} setPage={setPage} />
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
