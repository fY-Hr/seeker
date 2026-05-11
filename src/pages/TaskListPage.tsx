import { useState, useEffect, useRef } from "react";
import TaskListView from "./view/TaskListView";
import CreateEditTaskView from "./view/CreateEditTaskView";
import { playClickSound } from "../shared/utils/clickSound";
import type { SettingsData } from "../shared/type";

export type TaskListFormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; taskId: string };

type TaskListPageProps = {
  changePage: React.Dispatch<React.SetStateAction<string>>;
  mode: SettingsData["mode"];
  setCurrentTaskId: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function TaskListPage({ changePage, mode, setCurrentTaskId }: TaskListPageProps) {
  const [taskForm, setTaskForm] = useState<TaskListFormState>({ mode: "closed" });
  const [lastEditedTaskId, setLastEditedTaskId] = useState<string | null>(null);
  const taskFormRef = useRef(taskForm);
  taskFormRef.current = taskForm;

  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "n") {
        setLastEditedTaskId(null);
        setTaskForm({ mode: "create" });
        playClickSound();
        return;
      }

      if (taskFormRef.current.mode !== "closed") {
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changePage]);

  return (
    <>
      {taskForm.mode !== "closed" ? (
        <CreateEditTaskView
          actionType={taskForm.mode === "create" ? "create" : "edit"}
          editingTaskId={taskForm.mode === "edit" ? taskForm.taskId : null}
          onClose={() => setTaskForm({ mode: "closed" })}
        />
      ) : (
        <TaskListView
          changePage={changePage}
          mode={mode}
          setCurrentTaskId={setCurrentTaskId}
          onEditTask={(taskId) => {
            setTaskForm({ mode: "edit", taskId });
            setLastEditedTaskId(taskId);
          }}
          lastEditedTaskId={lastEditedTaskId}
        />
      )}
    </>
  );
}
