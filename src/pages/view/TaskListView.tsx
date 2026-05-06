import TaskListPanel from "../../components/TaskListPanel";
import { loadData } from "../../shared/utils/storage";
import { useEffect, useState, useRef, useMemo } from "react";
import type { SettingsData, Task } from "../../shared/type";
import { playClickSound } from "../../shared/utils/clickSound";
import ViewHint from "../../components/ViewHint";
import KeyboardKey from "../../components/KeyboardKey";
import Panel from "../../components/Panel";
import { deleteTask, updateCurrentTaskId, updateTaskUrgency } from "../../shared/utils/task";

type TaskListViewProps = {
  changePage: React.Dispatch<React.SetStateAction<string>>;
  mode: SettingsData["mode"];
  setCurrentTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  onEditTask: (taskId: string) => void;
  lastEditedTaskId: string | null;
};

export default function TaskListView({
  mode,
  changePage,
  setCurrentTaskId,
  onEditTask,
  lastEditedTaskId,
}: TaskListViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState(0);
  const [armedTask, setArmedTask] = useState<string>("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const armedTaskRef = useRef(armedTask);
  armedTaskRef.current = armedTask;

  const selectedTaskRef = useRef(selectedTask);
  selectedTaskRef.current = selectedTask;

  const rowRefs = useRef<HTMLDivElement[]>([]);

  const urgencyOrder = {
    none: 3,
    low: 2,
    medium: 1,
    high: 0
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const ua = urgencyOrder[a.urgency ?? "none"];
      const ub = urgencyOrder[b.urgency ?? "none"];
      if (ua !== ub) return ua - ub;
      const ma = a.modifiedAt ?? "";
      const mb = b.modifiedAt ?? "";
      if (ma !== mb) return mb.localeCompare(ma);
      return a.title.localeCompare(b.title);
    });
  }, [tasks]);

  useEffect(() => {
    if (selectedTaskId === null) return;
    const taskIndex = sortedTasks.findIndex((task) => task.id === selectedTaskId);
    setSelectedTask(taskIndex >= 0 ? taskIndex : 0);
    setSelectedTaskId(null);
  }, [sortedTasks, selectedTaskId]);

  useEffect(() => {
    async function fetchData() {
      const data = await loadData();
      const persistedFocusId = data.trackup.currentTaskId;
      const focusTaskId = lastEditedTaskId ?? persistedFocusId ?? null;
      if (focusTaskId) {
        setSelectedTaskId(focusTaskId);
      }
      if (mode == "trackup") {
        setTasks(data.trackup.tasks ?? []);
      } else {
        setTasks([]);
      }
    }

    fetchData();
  }, [mode, lastEditedTaskId]);

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      const jKey = e.key === "j";
      const kKey = e.key === "k";
      const enterKey = e.key === "Enter";
      const escapeKey = e.key === "Escape" || e.key === "Esc";

      if (e.repeat && (enterKey || escapeKey)) {
        return;
      }

      if (isDeleteConfirmOpen) {
        if (enterKey && armedTaskRef.current) {
          handleDeleteTask(armedTaskRef.current);
        }
        if (escapeKey) {
          playClickSound();
          setIsDeleteConfirmOpen(false);
        }
        return;
      }

      handleKeyDownDeleteTask(e);
      handleKeyDownUpdateUrgency(e);

      if (armedTaskRef.current && e.key.toLowerCase() === "e" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        playClickSound();
        onEditTask(armedTaskRef.current);
        return;
      }

      if (escapeKey) {
        handleUnselectTask();
        return;
      }
      if (armedTaskRef.current === "") {
        if (jKey) {
          setSelectedTask((prev) => {
            const n = sortedTasks.length;
            if (n === 0) return 0;
            return prev === n - 1 ? 0 : prev + 1;
          });
        }
        if (kKey) {
          setSelectedTask((prev) => {
            const n = sortedTasks.length;
            if (n === 0) return 0;
            return prev === 0 ? n - 1 : prev - 1;
          });
        }
      }
      if (enterKey) {
        if (armedTaskRef.current === "") {
          playClickSound();
          handleSelectedTask(selectedTaskRef.current);
          return;
        } else {
          playClickSound();
          const taskId = sortedTasks[selectedTaskRef.current].id;
          setCurrentTaskId(taskId);
          await updateCurrentTaskId(taskId);
          changePage("main");
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tasks, isDeleteConfirmOpen, sortedTasks, setCurrentTaskId, changePage, onEditTask]);

  useEffect(() => {
    if (tasks.length === 0) return;
    const el = rowRefs.current[selectedTask];
    el?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedTask, tasks.length]);

  function handleSelectedTask(index: number) {
    setArmedTask(sortedTasks[index].id);
  }

  function handleUnselectTask() {
    playClickSound();
    setArmedTask("");
    setIsDeleteConfirmOpen(false);
  }

  async function handleUpdateTaskUrgency(id: string, urgency: Task["urgency"]) {
    const result = await updateTaskUrgency(id, urgency);
    if (!result.isUpdated) return;

    await playClickSound();
    setTasks(result.tasks);
    setArmedTask("");
    setSelectedTask(0);
  }

  async function handleDeleteTask(id: string) {
    playClickSound();
    const updatedTasks = await deleteTask(id);
    setTasks(updatedTasks);
    setIsDeleteConfirmOpen(false);
    setArmedTask("");
    setSelectedTask(0);
  }

  function handleKeyDownDeleteTask(e: KeyboardEvent) {
    if (!armedTaskRef.current) return;
    if (e.key === "Delete" && e.shiftKey) {
      handleDeleteTask(armedTaskRef.current);
      return;
    }

    if (e.key === "Delete") {
      playClickSound();
      setIsDeleteConfirmOpen(true);
    }
  }

  function handleKeyDownUpdateUrgency(e: KeyboardEvent) {
    switch (e.key) {
      case "1":
        handleUpdateTaskUrgency(armedTaskRef.current, "none");
        break;
      case "2":
        handleUpdateTaskUrgency(armedTaskRef.current, "low");
        break;
      case "3":
        handleUpdateTaskUrgency(armedTaskRef.current, "medium");
        break;
      case "4":
        handleUpdateTaskUrgency(armedTaskRef.current, "high");
        break;
      default:
        break;
    }
  }

  function borderColor(urgency: Task["urgency"]) {
    return urgency === "none"
      ? "border-blue-400 border-t-blue-100 border-l-blue-100"
      : urgency === "low"
        ? "border-green-400 border-t-green-100 border-l-green-100"
        : urgency === "medium"
          ? "border-yellow-400 border-t-yellow-100 border-l-yellow-100"
          : urgency === "high"
            ? "border-red-400 border-t-red-100 border-l-red-100"
            : "";
  }

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {isDeleteConfirmOpen && armedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <Panel className="max-w-md p-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm">Delete this task?</p>
              <p className="text-xs text-gray-700">This action cannot be undone.</p>
              <span className="flex flex-wrap items-center gap-1 text-[13px] leading-snug">
                <KeyboardKey>Enter</KeyboardKey> to confirm, <KeyboardKey>Esc</KeyboardKey> to cancel.
              </span>
            </div>
          </Panel>
        </div>
      )}
      {tasks.length > 0 ? (
        <section className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {sortedTasks.map((task, index) => { 
            const activeSubTasks = task.subTasks.filter((subTask) => subTask.mark === "none").length
            const todoSubTasks = task.subTasks.filter((subTask) => subTask.mark === "todo").length
            return (
            <div
              key={task.id}
              ref={(el: HTMLDivElement) => (rowRefs.current[index] = el)}
              className="scroll-mt-12 scroll-mb-11 cursor-pointer"
              onClick={() => {
                playClickSound();
                setSelectedTask(index);
                setArmedTask("");
              }}
            >
              <TaskListPanel
                title={task.title}
                description={task.description}
                urgency={task.urgency ?? "none"}
                className={armedTask === task.id ? borderColor(task.urgency ?? "none") : ""}
                isSelected={index === selectedTask}
                isArmed={armedTask === task.id}
                todoSubTasks={todoSubTasks}
                activeSubTasks={activeSubTasks}
              />
            </div>
          )})}
        </section>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-center">No task yet,</p>
          <p className="text-center">
            <KeyboardKey>Shift</KeyboardKey> + <KeyboardKey>N</KeyboardKey> to create a new task.
          </p>
        </div>
      )}
      {armedTask && !isDeleteConfirmOpen && (
        <ViewHint>
          <div className="flex flex-wrap items-center gap-1 text-sm justify-center">
            <KeyboardKey>j</KeyboardKey>/<KeyboardKey>k</KeyboardKey> move,
            <KeyboardKey>1</KeyboardKey>
            <KeyboardKey>2</KeyboardKey>
            <KeyboardKey>3</KeyboardKey>
            <KeyboardKey>4</KeyboardKey> set urgency,
            <KeyboardKey>Enter</KeyboardKey> confirm,
            <KeyboardKey>e</KeyboardKey> edit,
            <KeyboardKey>Delete</KeyboardKey> delete,
            <KeyboardKey>Esc</KeyboardKey> cancel
          </div>
        </ViewHint>
      )}
    </div>
  );
}
