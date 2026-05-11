import KeyboardKey from "../../../components/KeyboardKey";
import ViewHint from "../../../components/ViewHint";
import type { Task } from "../../../shared/type";
import { createSubTask, createMultiSubTasks, deleteSubTask, markSubTaskCompleted, updateSubTaskTitle, toggleToTodo } from "../../../shared/utils/subTask";
import { loadData } from "../../../shared/utils/storage";
import { playClickSound } from "../../../shared/utils/clickSound";
import { useEffect, useRef, useState, useMemo } from "react";

type TrackUpProgressiveViewProps = {
  currentTaskId: string | null;
};

export default function TrackUpProgressiveView({ currentTaskId }: TrackUpProgressiveViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubTask, setSelectedSubTask] = useState(0);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [draftSubTaskTitle, setDraftSubTaskTitle] = useState("");
  const [isCreatingMultiSubTasks, setIsCreatingMultiSubTasks] = useState(false);
  const [isCompletedSubTasksOpen, setIsCompletedSubTasksOpen] = useState(false);
  
  const selectedTaskRef = useRef<Task | null>(selectedTask);
  const selectedSubTaskRef = useRef(selectedSubTask);
  const editingSubTaskIdRef = useRef<string | null>(editingSubTaskId);
  const draftSubTaskTitleRef = useRef(draftSubTaskTitle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const selectAllOnFocusRef = useRef(false);
  const isCreatingMultiSubTasksRef = useRef(isCreatingMultiSubTasks);
  const isDeleteConfirmOpenRef = useRef(isDeleteConfirmOpen);
  const isCompletedSubTasksOpenRef = useRef(isCompletedSubTasksOpen);

  selectedTaskRef.current = selectedTask;
  selectedSubTaskRef.current = selectedSubTask;
  editingSubTaskIdRef.current = editingSubTaskId;
  draftSubTaskTitleRef.current = draftSubTaskTitle;
  isCreatingMultiSubTasksRef.current = isCreatingMultiSubTasks;
  isDeleteConfirmOpenRef.current = isDeleteConfirmOpen;
  isCompletedSubTasksOpenRef.current = isCompletedSubTasksOpen;

  const notCompletedRowRefs = useRef<HTMLDivElement[]>([]);
  const completedRowRefs = useRef<HTMLDivElement[]>([]);

  function notCompletedSubTasksOf(task: Task) {
    return task.subTasks.filter((subTask) => subTask.mark !== "completed");
  }

  function completedSubTasksOf(task: Task) {
    return task.subTasks.filter((subTask) => subTask.mark === "completed");
  }

  const notCompletedSubTasks = useMemo(
    () => (selectedTask ? notCompletedSubTasksOf(selectedTask) : []),
    [selectedTask]
  );
  const completedSubTasks = useMemo(
    () => (selectedTask ? completedSubTasksOf(selectedTask) : []),
    [selectedTask]
  );

  useEffect(() => {
    async function fetchCurrentTask() {
      if (!currentTaskId) {
        setSelectedTask(null);
        setSelectedSubTask(0);
        return;
      }

      const data = await loadData();
      const task = (data.trackup.tasks ?? []).find((item) => item.id === currentTaskId) ?? null;
      setSelectedTask(task);
      setSelectedSubTask(0);
    }

    fetchCurrentTask();
  }, [currentTaskId]);

  useEffect(() => {
    if (!editingSubTaskId) return;
    setTimeout(() => {
      inputRef.current?.focus();
      const length = inputRef.current?.value.length ?? 0;
      if (selectAllOnFocusRef.current) {
        inputRef.current?.setSelectionRange(0, length);
        selectAllOnFocusRef.current = false;
      } else {
        inputRef.current?.setSelectionRange(length, length);
      }
    }, 0);
  }, [editingSubTaskId]);

  useEffect(() => {
    if (!editingSubTaskId || !inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [draftSubTaskTitle, editingSubTaskId]);

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      if (!selectedTaskRef.current) return;

      const enterKey = e.key === "Enter";
      const escapeKey = e.key === "Escape" || e.key === "Esc";
      const mod = e.ctrlKey || e.metaKey;
      const notCompletedSubTaskCount = notCompletedSubTasksOf(selectedTaskRef.current).length;
      const completedSubTaskCount = completedSubTasksOf(selectedTaskRef.current).length;
      const subTaskCount = isCompletedSubTasksOpenRef.current ? completedSubTaskCount : notCompletedSubTaskCount;

      if (e.repeat && (escapeKey)) {
        return;
      }

      if (!isDeleteConfirmOpenRef.current && !editingSubTaskIdRef.current) {
        if (enterKey) {
          e.preventDefault();
          playClickSound();
          await handleToggleToTodo();
          return;
        }
      }

      if (isDeleteConfirmOpenRef.current) {
        if (enterKey) {
          await handleDeleteSubTask(true);
        }
        if (escapeKey) {
          playClickSound();
          setIsDeleteConfirmOpen(false);
        }
        return;
      }

      if (editingSubTaskIdRef.current) {
        if (enterKey && !e.shiftKey && isCreatingMultiSubTasksRef.current) {
          e.preventDefault();
          await submitDraftSubTasksFromLines();
          return;
        }
        if (enterKey && !e.shiftKey) {
          e.preventDefault();
          await submitDraftSubTaskTitle();
        }
        if (escapeKey) {
          cancelEditSubTask();
        }
        return;
      }

      if (mod && (e.key.toUpperCase() === "I" || e.key.toLowerCase() === "i")) {
        setIsInfoOpen((prev) => !prev);
        return;
      }

      if (mod && (e.key.toUpperCase() === "N" || e.key.toLowerCase() === "n")) {
        playClickSound();
        setIsCompletedSubTasksOpen(false);
        setIsCreatingMultiSubTasks(false);
        await handleCreateSubTask();
        return;
      }

      if (mod && (e.key.toUpperCase() === "M" || e.key.toLowerCase() === "m")) {
        playClickSound();
        setIsCompletedSubTasksOpen(false);
        setIsCreatingMultiSubTasks(true);
        await handleCreateSubTask();
        return;
      }

      if (mod && (e.key.toUpperCase() === "C" || e.key.toLowerCase() === "c")) {
        setIsCompletedSubTasksOpen((prev) => !prev);
        setSelectedSubTask(0);
        return;
      }

      if (subTaskCount > 0 && (e.key.toUpperCase() === "J" || e.key.toLowerCase() === "j")) {
        setSelectedSubTask((prev) =>
          prev === subTaskCount - 1
            ? 0
            : (e.altKey ? (prev + 5 > subTaskCount - 1 ? subTaskCount - 1 : prev + 5) : prev) + (e.altKey ? 0 : 1)
        );
        return;
      }

      if (subTaskCount > 0 && (e.key.toUpperCase() === "K" || e.key.toLowerCase() === "k")) {
        setSelectedSubTask((prev) =>
          prev === 0
            ? subTaskCount - 1
            : (e.altKey ? (prev - 5 < 0 ? 0 : prev - 5) : prev) - (e.altKey ? 0 : 1)
        );
        return;
      }

      if (subTaskCount > 0 && (e.key.toUpperCase() === "E" || e.key.toLowerCase() === "e")) {
        if(isCompletedSubTasksOpenRef.current) return;
        armEditSubTask();
        return;
      }

      if (subTaskCount > 0 && (e.key === " " || e.key.toUpperCase() === "X" || e.key.toLowerCase() === "x")) {
        e.preventDefault();
        playClickSound();
        await handleMarkSubTaskCompleted();
        return;
      }

      if (subTaskCount > 0 && e.key === "Delete" && e.shiftKey) {
        await handleDeleteSubTask(true);
        return;
      }

      if (subTaskCount > 0 && e.key === "Delete") {
        playClickSound();
        setIsDeleteConfirmOpen(true);
        return;
      }

      if (escapeKey) {
        setIsInfoOpen((prev) => {
          if (prev) playClickSound();
          return false;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const rowRefs = isCompletedSubTasksOpenRef.current ? completedRowRefs.current : notCompletedRowRefs.current;
    if (notCompletedSubTasks.length === 0) return;
    const el = rowRefs[selectedSubTask];
    el?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedSubTask, notCompletedSubTasks, isCompletedSubTasksOpen]);

  function syncSelectedTask(task: Task | null) {
    setSelectedTask(task);
    if (!task) {
      setSelectedSubTask(0);
      return;
    }
    const incomplete = notCompletedSubTasksOf(task);
    if (incomplete.length === 0) {
      setSelectedSubTask(0);
      return;
    }
    setSelectedSubTask((prev) => Math.min(prev, incomplete.length - 1));
  }

  function getActiveTaskContext() {
    const taskId = currentTaskId;
    const current = selectedTaskRef.current;
    if (!taskId || !current) return null;
    return { taskId, current };
  }

  async function handleCreateSubTask() {
    const context = getActiveTaskContext();
    if (!context) return;
    const result = await createSubTask(context.taskId);
    if (!result.task || !result.subTask) return;
    syncSelectedTask(result.task);
    selectAllOnFocusRef.current = true;
    setEditingSubTaskId(result.subTask.id);
    setDraftSubTaskTitle(result.subTask.title);
    setSelectedSubTask(notCompletedSubTasksOf(result.task).length - 1);
  }

  function armEditSubTask() {
    const current = selectedTaskRef.current;
    const incomplete = current ? notCompletedSubTasksOf(current) : [];
    if (incomplete.length === 0) return;
    const subTask = incomplete[selectedSubTaskRef.current];
    if (!subTask) return;
    setIsCreatingMultiSubTasks(false);
    selectAllOnFocusRef.current = false;
    setEditingSubTaskId(subTask.id);
    setDraftSubTaskTitle(subTask.title);
  }

  function cancelEditSubTask() {
    setEditingSubTaskId(null);
    setDraftSubTaskTitle("");
    setIsCreatingMultiSubTasks(false);
  }

  async function submitDraftSubTaskTitle() {
    const context = getActiveTaskContext();
    const editingId = editingSubTaskIdRef.current;
    if (!context || !editingId) return;

    const nextTitle = draftSubTaskTitleRef.current.trim();
    if (!nextTitle) {
      cancelEditSubTask();
      return;
    }

    const result = await updateSubTaskTitle(context.taskId, editingId, nextTitle);
    if (result.task) {
      syncSelectedTask(result.task);
      playClickSound();
    }
    cancelEditSubTask();
  }

  async function submitDraftSubTasksFromLines() {
    const context = getActiveTaskContext();
    const editingId = editingSubTaskIdRef.current;
    if (!context || !editingId) return;

    const result = await createMultiSubTasks(context.taskId, draftSubTaskTitleRef.current, editingId);
    if (result.task) {
      syncSelectedTask(result.task);
      playClickSound();
      const createdSubTaskId = result.subTasks[0]?.id;
      if (createdSubTaskId) {
        const nextIncomplete = notCompletedSubTasksOf(result.task);
        const createdIndex = nextIncomplete.findIndex((subTask) => subTask.id === createdSubTaskId);
        if (createdIndex >= 0) {
          setSelectedSubTask(createdIndex);
        }
      }
    }
    cancelEditSubTask();
  }

  async function handleMarkSubTaskCompleted() {
    const context = getActiveTaskContext();
    if (!context) return;
    const subTask = isCompletedSubTasksOpenRef.current ? completedSubTasksOf(context.current)[selectedSubTaskRef.current] : notCompletedSubTasksOf(context.current)[selectedSubTaskRef.current];
    if (!subTask) return;
    const result = await markSubTaskCompleted(context.taskId, subTask.id);
    if (result.task) {
      syncSelectedTask(result.task);
    }
  }

  async function handleToggleToTodo() {
    const context = getActiveTaskContext();
    if (!context) return;
    const subTask = isCompletedSubTasksOpenRef.current ? completedSubTasksOf(context.current)[selectedSubTaskRef.current] : notCompletedSubTasksOf(context.current)[selectedSubTaskRef.current];
    if (!subTask) return;
    const result = await toggleToTodo(context.taskId, subTask.id);
    if (result.task) {
      syncSelectedTask(result.task);
    }
  }

  async function handleDeleteSubTask(isImmediateDelete: boolean) {
    const context = getActiveTaskContext();
    if (!context) return;
    const incomplete = isCompletedSubTasksOpenRef.current ? completedSubTasksOf(context.current) : notCompletedSubTasksOf(context.current);
    if (incomplete.length === 0) return;
    const subTask = incomplete[selectedSubTaskRef.current];
    if (!subTask) return;
    if (!isImmediateDelete) {
      setIsDeleteConfirmOpen(true);
      return;
    }

    playClickSound();
    const result = await deleteSubTask(context.taskId, subTask.id);
    if (result.task) {
      syncSelectedTask(result.task);
    }
    setIsDeleteConfirmOpen(false);
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-2 p-2">
        {selectedTask ? (
          <>
            {isInfoOpen && (
              <div className="border border-black bg-white/70 p-2 text-sm">
                <p className="font-semibold">{selectedTask.title}</p>
                <p className="text-xs text-gray-700">{selectedTask.description || "No description."}</p>
              </div>
            )}

            {isDeleteConfirmOpen && (
              <div className="border border-black bg-red-50 p-2 text-sm">
                <p>Delete selected sub task?</p>
                <p className="text-xs">
                  <KeyboardKey>Enter</KeyboardKey> confirm, <KeyboardKey>Esc</KeyboardKey> cancel
                </p>
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
              <div className="flex flex-col gap-1">
                <div className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                  Active ({notCompletedSubTasks.length})
                </div>
                {notCompletedSubTasks.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {notCompletedSubTasks.map((subTask, index) => {
                      const isSelected = index === selectedSubTask;
                      const isEditing = editingSubTaskId === subTask.id;
                      return (
                        <div
                          key={subTask.id}
                          className={`px-2 py-1 ${
                            subTask.mark === "todo" ? isSelected && !isCompletedSubTasksOpen ? "bg-lime-200" : "bg-lime-100" :
                            isSelected && !isCompletedSubTasksOpen ? "bg-black/20" : "bg-black/5"
                            } scroll-mt-12 scroll-mb-12`}
                          ref={(el: HTMLDivElement) => (notCompletedRowRefs.current[index] = el)}
                        >
                          {isEditing ? (
                            <textarea
                              ref={inputRef}
                              value={draftSubTaskTitle}
                              onChange={(e) => setDraftSubTaskTitle(e.target.value)}
                              className="w-full resize-none overflow-hidden border border-black bg-white px-2 py-1 text-sm outline-none"
                              rows={1}
                            />
                          ) : (
                            <p className={`text-sm wrap-break-word ${subTask.mark === "completed" ? "line-through text-gray-600" : ""}`}>
                              {subTask.mark === "todo" ? "[TODO]" : ""} {isSelected && !isCompletedSubTasksOpenRef.current ? subTask.title : subTask.title.length > 84 ? subTask.title.slice(0, 72) + "..." : subTask.title}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ):(<div className="px-2 py-1 text-xs text-gray-500">
                  <p>No sub tasks yet. <KeyboardKey>Ctrl</KeyboardKey> + <KeyboardKey>N</KeyboardKey> to create a new sub task</p>
                </div>)}
                <button
                  type="button"
                  className={`mt-2 flex w-full items-center justify-between border px-2 py-1 text-left text-sm outline-none ${
                    isCompletedSubTasksOpen ? "border-black/40 bg-black/10" : "border-dashed border-black/30 bg-[rgb(240,240,240)]"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    playClickSound();
                    setIsCompletedSubTasksOpen((prev) => !prev);
                  }}
                >
                  <span className="font-medium">Completed ({completedSubTasks.length})</span>
                  <span className="text-xs text-gray-600">{isCompletedSubTasksOpen ? "Hide" : "Show"}</span>
                </button>
                  <div className="mt-1 flex flex-col gap-1 pl-2">
                    {isCompletedSubTasksOpen && completedSubTasks.length > 0 && (
                      <div className="px-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        Archived
                      </div>
                    )}
                    {isCompletedSubTasksOpen && completedSubTasks.length > 0 && completedSubTasks.map((subTask, index) => {
                      const isSelected = index === selectedSubTask;
                      return (
                        <div key={subTask.id} ref={(el: HTMLDivElement) => (completedRowRefs.current[index] = el)} className={`flex px-2 py-1 text-sm ${isSelected ? "bg-black/15" : "bg-black/5"} scroll-mt-16 scroll-mb-16 scroll-ml-2 scroll-mr-2`}>
                          <p className="line-through text-gray-600">{isSelected && isCompletedSubTasksOpenRef.current ? subTask.title : subTask.title.length > 84 ? subTask.title.slice(0, 70) + "..." : subTask.title}</p>
                        </div>
                      );
                    })}
                    {isCompletedSubTasksOpen && completedSubTasks.length === 0 && (
                      <p className="px-2 py-1 text-xs text-gray-500">No completed sub tasks yet.</p>
                    )}
                  </div>
              </div>
            </div>

            <ViewHint className="mt-auto w-full shrink-0 pt-2">
              <KeyboardKey>j</KeyboardKey>/<KeyboardKey>k</KeyboardKey> move,
              <KeyboardKey>Space</KeyboardKey>/<KeyboardKey>x</KeyboardKey> toggle done, <KeyboardKey>e</KeyboardKey> edit,{" "}
              <KeyboardKey>Delete</KeyboardKey> delete,{" "}
              <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>N</KeyboardKey> new, <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>M</KeyboardKey> multi-create,{" "}
              <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>I</KeyboardKey> info,{" "}
              <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>Esc</KeyboardKey> task list
            </ViewHint>
          </>
        ) : (
          <div className="mb-7 flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p>No task selected</p>
            <p>
              <KeyboardKey>Ctrl</KeyboardKey> + <KeyboardKey>Esc</KeyboardKey> to go to task list
            </p>
          </div>
        )}
      </div>
    </>
  );
}
