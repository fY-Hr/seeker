import { useEffect, useMemo, useState, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { playClickSound } from "../../shared/utils/clickSound";
import { loadData, saveData } from "../../shared/utils/storage";
import Panel from "../../components/Panel";
import ViewHint from "../../components/ViewHint";
import type { Task } from "../../shared/type";
import KeyboardKey from "../../components/KeyboardKey";
import { patchTask } from "../../shared/utils/task";

export type TaskFormActionType = "create" | "edit";

type CreateEditTaskViewProps = {
  actionType: TaskFormActionType;
  editingTaskId: string | null;
  onClose: () => void;
};

export default function CreateEditTaskView({ actionType, editingTaskId, onClose }: CreateEditTaskViewProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [isDraftArmed, setIsDraftArmed] = useState(false);
  const [cancelArmed, setCancelArmed] = useState(false);
  const [mandatoryBreak, setMandatoryBreak] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (actionType !== "edit" || !editingTaskId) return;

    async function loadTask() {
      const data = await loadData();
      const task = (data.trackup.tasks ?? []).find((t) => t.id === editingTaskId) ?? null;
      if (!task) {
        onCloseRef.current();
        return;
      }
      setTaskTitle(task.title);
      setTaskDetails(task.description ?? "");
      setIsDraftArmed(false);
    }

    loadTask();
  }, [actionType, editingTaskId]);

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      const escapeKey = e.key === "Escape" || e.key === "Esc";
      if (escapeKey) {
        if (isDraftArmed) {
          triggerCancelArmed();
          setIsDraftArmed(false);
          return;
        }
        playClickSound();
        onClose();
      }
    }

    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDraftArmed, onClose]);

  function triggerMandatory() {
    setMandatoryBreak(true);
    setTimeout(() => {
      setMandatoryBreak(false);
    }, 100);
  }

  function triggerCancelArmed() {
    setCancelArmed(true);
    setTimeout(() => {
      setCancelArmed(false);
    }, 100);
  }

  function validateTitle() {
    if (taskTitle.trim().length <= 0) {
      triggerMandatory();
      return;
    }
    if (taskTitle.trim().length < 3) {
      triggerMandatory();
      return;
    }
    if (taskTitle.trim().length > 64) {
      triggerMandatory();
      return;
    }

    setIsDraftArmed(true);
  }

  function handleTabBetweenFields(e: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;

    e.preventDefault();

    const forward = !e.shiftKey;
    const onTitle = e.currentTarget === titleInputRef.current;

    if (forward) {
      if (onTitle) detailRef.current?.focus();
      else titleInputRef.current?.focus();
    } else {
      if (onTitle) detailRef.current?.focus();
      else titleInputRef.current?.focus();
    }
  }

  async function handleFormKeyDown(e: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    handleTabBetweenFields(e);

    if (e.key !== "Enter") return;

    if (e.shiftKey && e.key == "Enter") return;

    e.preventDefault();

    if (isDraftArmed) {
      if (actionType === "edit") {
        if (!editingTaskId) return;
        await patchTask(editingTaskId, (task: Task) => ({
          ...task,
          title: taskTitle.trim(),
          description: taskDetails.trim(),
          modifiedAt: new Date().toISOString(),
        }));
        await playClickSound();
        setIsDraftArmed(false);
        onClose();
        return;
      }

      const data = await loadData();
      const nextTask: Task = {
        id: crypto.randomUUID(),
        title: taskTitle.trim(),
        description: taskDetails.trim(),
        urgency: "none",
        subTasks: [],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };

      data.trackup.tasks = [...(data.trackup.tasks || []), nextTask];
      await saveData(data);
      await playClickSound();
      setIsDraftArmed(false);
      setTaskTitle("");
      setTaskDetails("");
      onClose();
      return;
    }
    validateTitle();
  }

  const input = "w-full border border-black px-3 py-2 outline-none";

  const titleCountTone = useMemo(() => {
    if (taskTitle.length > 54) return "text-red-700";
    if (taskTitle.length > 36) return "text-[#9a5a00]";
    return "text-[rgb(79,79,79)]";
  }, [taskTitle.length]);

  const headingLabel = actionType === "create" ? "Create Task" : "Edit Task";

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="w-fit -mt-2 border-x-2 border-b-2 bg-[rgb(246,246,246)] px-2 py-1 text-sm">{headingLabel}</h1>
          </div>
        </div>
      </section>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Panel className="p-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="task-title">Task title</label>
                <span className={`text-sm ${titleCountTone}`}>{taskTitle.length}/64</span>
              </div>
              <input
                id="task-title"
                ref={titleInputRef}
                className={`${input} ${mandatoryBreak || cancelArmed ? "bg-red-700 text-white" : isDraftArmed ? "bg-[#006975] text-white" : "focus:bg-[#f6ffdf]"}`}
                maxLength={64}
                placeholder="finish the UI polish pass"
                value={taskTitle}
                readOnly={isDraftArmed}
                onKeyDown={handleFormKeyDown}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="task-details">Detail / notes</label>
              <textarea
                id="task-details"
                ref={detailRef}
                className={`${input} min-h-24 resize-none ${isDraftArmed ? "bg-[#006975] text-white" : "focus:bg-[#f6ffdf]"} ${cancelArmed ? "bg-red-400 text-white" : ""}`}
                placeholder="more detail to the task, or anything that you should not forget."
                value={taskDetails}
                readOnly={isDraftArmed}
                onKeyDown={handleFormKeyDown}
                onChange={(e) => setTaskDetails(e.target.value)}
              />
            </div>
          </div>
        </Panel>
      </div>

      <ViewHint>
        <div className="flex gap-2">
          {!isDraftArmed && (
            <span className="flex flex-wrap items-center gap-1">
              <KeyboardKey>Esc</KeyboardKey> go back,
            </span>
          )}
          <span
            className={`flex flex-wrap items-center gap-1 text-[13px] leading-snug ${isDraftArmed ? "text-[#006975]" : "text-[rgb(79,79,79)]"}`}
          >
            {isDraftArmed ? (
              <>
                Draft armed, <KeyboardKey>Esc</KeyboardKey> cancel
              </>
            ) : (
              <>
                <KeyboardKey>Enter</KeyboardKey> arm draft
              </>
            )}
          </span>
        </div>
      </ViewHint>
    </div>
  );
}
