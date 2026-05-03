import { loadData, saveData } from "./storage";
import type { Task } from "../type";

type TaskPatchResult = {
  tasks: Task[];
  task: Task | null;
  isUpdated: boolean;
};

export async function patchTask(taskId: string, updater: (task: Task) => Task): Promise<TaskPatchResult> {
  const data = await loadData();
  const currentTasks: Task[] = data.trackup.tasks ?? [];
  let updatedTask: Task | null = null;
  let isUpdated = false;

  const nextTasks = currentTasks.map((task) => {
    if (task.id !== taskId) return task;
    const candidate = updater(task);
    updatedTask = candidate;
    if (candidate !== task) {
      isUpdated = true;
    }
    return candidate;
  });

  if (!isUpdated) {
    return {
      tasks: currentTasks,
      task: updatedTask,
      isUpdated: false,
    };
  }

  data.trackup.tasks = nextTasks;
  await saveData(data);

  return {
    tasks: nextTasks,
    task: updatedTask,
    isUpdated: true,
  };
}

export async function updateTaskUrgency(id: string, urgency: Task["urgency"]) {
  const result = await patchTask(id, (task) => {
    if (task.urgency === urgency) return task;
    return {
      ...task,
      urgency,
      modifiedAt: new Date().toISOString(),
    };
  });

  return {
    tasks: result.tasks,
    isUpdated: result.isUpdated,
  };
}

export async function deleteTask(id: string) {
  const data = await loadData();
  const currentTasks: Task[] = data.trackup.tasks ?? [];
  const updatedTasks = currentTasks.filter((task) => task.id !== id);

  data.trackup.tasks = updatedTasks;
  if (data.trackup.currentTaskId === id) {
    data.trackup.currentTaskId = null;
  }
  await saveData(data);

  return updatedTasks;
}

export async function updateCurrentTaskId(id: string) {
  const data = await loadData();
  const task = (data.trackup.tasks ?? []).find((item: Task) => item.id === id);
  if (!task) return;
  if (data.trackup.currentTaskId === id) return;

  data.trackup.currentTaskId = id;
  await saveData(data);
}
