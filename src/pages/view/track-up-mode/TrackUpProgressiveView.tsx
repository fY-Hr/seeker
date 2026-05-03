import KeyboardKey from "../../../components/KeyboardKey";
import ViewHint from "../../../components/ViewHint";
import type { Task } from "../../../shared/type";
import { createSubTask, deleteSubTask, markSubTaskCompleted, updateSubTaskTitle } from "../../../shared/utils/subTask";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompletedSubTasksOpen, setIsCompletedSubTasksOpen] = useState(false);

  const selectedTaskRef = useRef<Task | null>(selectedTask);
  const selectedSubTaskRef = useRef(selectedSubTask);
  const editingSubTaskIdRef = useRef<string | null>(editingSubTaskId);
  const draftSubTaskTitleRef = useRef(draftSubTaskTitle);
  const isDeleteConfirmOpenRef = useRef(isDeleteConfirmOpen);

  selectedTaskRef.current = selectedTask;
  selectedSubTaskRef.current = selectedSubTask;
  editingSubTaskIdRef.current = editingSubTaskId;
  draftSubTaskTitleRef.current = draftSubTaskTitle;
  isDeleteConfirmOpenRef.current = isDeleteConfirmOpen;

  const rowRefs = useRef<HTMLDivElement[]>([]);

  const notCompletedSubTasks = useMemo(() => {
    return selectedTaskRef.current?.subTasks.filter((subTask) => subTask.mark !== "completed") ?? [];
  }, [selectedTaskRef.current]);
  const completedSubTasks = useMemo(() => {
    return selectedTaskRef.current?.subTasks.filter((subTask) => subTask.mark === "completed") ?? [];
  }, [selectedTaskRef.current]);

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
      inputRef.current?.select();
    }, 0);
  }, [editingSubTaskId]);

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      if (!selectedTaskRef.current) return;

      const enterKey = e.key === "Enter";
      const escapeKey = e.key === "Escape" || e.key === "Esc";
      const subTaskCount = selectedTaskRef.current.subTasks.length;

      if (e.repeat && (enterKey || escapeKey)) {
        return;
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
        if (enterKey) {
          await submitDraftSubTaskTitle();
        }
        if (escapeKey) {
          cancelEditSubTask();
        }
        return;
      }

      if (e.shiftKey && e.key === "I") {
        setIsInfoOpen((prev) => !prev);
        return;
      }

      if (e.shiftKey && e.key === "N") {
        playClickSound();
        await handleCreateSubTask();
        return;
      }

      if (subTaskCount > 0 && e.key === "j") {
        setSelectedSubTask((prev) =>
          prev === subTaskCount - 1
            ? 0
            : (e.altKey ? (prev + 5 > subTaskCount - 1 ? subTaskCount - 1 : prev + 5) : prev) + (e.altKey ? 0 : 1)
        );
        return;
      }

      if (subTaskCount > 0 && e.key === "k") {
        setSelectedSubTask((prev) =>
          prev === 0
            ? subTaskCount - 1
            : (e.altKey ? (prev - 5 < 0 ? 0 : prev - 5) : prev) - (e.altKey ? 0 : 1)
        );
        return;
      }

      if (subTaskCount > 0 && e.key.toLowerCase() === "e") {
        armEditSubTask();
        return;
      }

      if (subTaskCount > 0 && (e.key === " " || e.key.toLowerCase() === "x")) {
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
    if (selectedTask?.subTasks.length === 0) return;
    const el = rowRefs.current[selectedSubTask];
    el?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedSubTask, selectedTask?.subTasks.length]);

  function syncSelectedTask(task: Task | null) {
    setSelectedTask(task);
    if (task && task.subTasks.length > 0) {
      setSelectedSubTask((prev) => Math.min(prev, task.subTasks.length - 1));
      return;
    }
    setSelectedSubTask(0);
  }

  async function handleCreateSubTask() {
    if (!currentTaskId) return;
    const current = selectedTaskRef.current;
    if (!current) return;
    const result = await createSubTask(currentTaskId);
    if (!result.task || !result.subTask) return;
    syncSelectedTask(result.task);
    const nextSubTasks = result.task.subTasks;
    setEditingSubTaskId(result.subTask.id);
    setDraftSubTaskTitle(result.subTask.title);
    setSelectedSubTask(nextSubTasks.length - 1);
  }

  function armEditSubTask() {
    const current = selectedTaskRef.current;
    if (!current || current.subTasks.length === 0) return;
    const subTask = current.subTasks[selectedSubTaskRef.current];
    if (!subTask) return;
    setEditingSubTaskId(subTask.id);
    setDraftSubTaskTitle(subTask.title);
  }

  function cancelEditSubTask() {
    setEditingSubTaskId(null);
    setDraftSubTaskTitle("");
  }

  async function submitDraftSubTaskTitle() {
    if (!currentTaskId) return;
    const current = selectedTaskRef.current;
    const editingId = editingSubTaskIdRef.current;
    if (!current || !editingId) return;

    const nextTitle = draftSubTaskTitleRef.current.trim();
    if (!nextTitle) {
      cancelEditSubTask();
      return;
    }

    const result = await updateSubTaskTitle(currentTaskId, editingId, nextTitle);
    if (result.task) {
      syncSelectedTask(result.task);
      playClickSound();
    }
    cancelEditSubTask();
  }

  async function handleMarkSubTaskCompleted() {
    if (!currentTaskId) return;
    const current = selectedTaskRef.current;
    if (!current || current.subTasks.length === 0) return;
    const subTask = current.subTasks[selectedSubTaskRef.current];
    if (!subTask) return;
    const result = await markSubTaskCompleted(currentTaskId, subTask.id);
    if (result.task) {
      syncSelectedTask(result.task);
    }
  }

  async function handleDeleteSubTask(isImmediateDelete: boolean) {
    if (!currentTaskId) return;
    const current = selectedTaskRef.current;
    if (!current || current.subTasks.length === 0) return;
    const subTask = current.subTasks[selectedSubTaskRef.current];
    if (!subTask) return;
    if (!isImmediateDelete) {
      setIsDeleteConfirmOpen(true);
      return;
    }

    playClickSound();
    const result = await deleteSubTask(currentTaskId, subTask.id);
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

            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {notCompletedSubTasks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {notCompletedSubTasks.map((subTask, index) => {
                    const isSelected = index === selectedSubTask;
                    const isEditing = editingSubTaskId === subTask.id;
                    const isNotCompleted = subTask.mark !== "completed";
                    return (
                      isNotCompleted ? (
                        <div
                          key={subTask.id}
                          className={`px-2 py-1 ${isSelected ? "bg-black/20" : "bg-black/5"}`}
                          ref={(el: HTMLDivElement) => (rowRefs.current[index] = el)}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              value={draftSubTaskTitle}
                              onChange={(e) => setDraftSubTaskTitle(e.target.value)}
                              className="w-full border border-black bg-white px-2 py-1 text-sm outline-none"
                              maxLength={64}
                            />
                          ) : (
                            <p className={`text-sm ${subTask.mark === "completed" ? "line-through text-gray-600" : ""}`}>
                              {subTask.title}
                            </p>
                          )}
                        </div>
                      ) : (<div></div>)
                    );
                  })}
                  <div className="flex text-sm px-2 py-1 mt-2 border border-dashed bg-[rgb(240,240,240)]">
                    <p onClick={() => setIsCompletedSubTasksOpen((prev) => !prev)}>completed task</p>
                  </div>
                    <div className="flex flex-col gap-1">
                      {isCompletedSubTasksOpen && completedSubTasks.length > 0 && completedSubTasks.map((subTask) => {
                        return (
                          <div key={subTask.id} className="flex text-sm px-2 py-1">
                            <p>{subTask.title}</p>
                          </div>
                        );
                      })}
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <p>No sub tasks...</p>
                  <p>
                    <KeyboardKey>Shift</KeyboardKey> + <KeyboardKey>N</KeyboardKey> to create a new sub task
                  </p>
                </div>
              )}
            </div>

            <ViewHint className="mt-auto w-full shrink-0 pt-2">
              <KeyboardKey>j</KeyboardKey>/<KeyboardKey>k</KeyboardKey> move,
              <KeyboardKey>Space</KeyboardKey>/<KeyboardKey>x</KeyboardKey> toggle done, <KeyboardKey>e</KeyboardKey> edit,{" "}
              <KeyboardKey>Delete</KeyboardKey> delete,{" "}
              <KeyboardKey>Shift</KeyboardKey>+<KeyboardKey>N</KeyboardKey> new, <KeyboardKey>Shift</KeyboardKey>+<KeyboardKey>I</KeyboardKey> info,{" "}
              <KeyboardKey>Shift</KeyboardKey>+<KeyboardKey>Esc</KeyboardKey> task list
            </ViewHint>
          </>
        ) : (
          <div className="mb-7 flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p>No task selected</p>
            <p>
              <KeyboardKey>Shift</KeyboardKey> + <KeyboardKey>Esc</KeyboardKey> to go to task list
            </p>
          </div>
        )}
      </div>
    </>
  );
}
