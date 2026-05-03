import type { Task } from "../type";
import { patchTask } from "./task";

type SubTask = Task["subTasks"][number];

export async function createSubTask(taskId: string, title = "new sub task") {
  const now = new Date().toISOString();
  const nextSubTask: SubTask = {
    id: crypto.randomUUID(),
    title,
    mark: "none",
    createdAt: now,
    modifiedAt: now
  };

  const result = await patchTask(taskId, (task) => ({
    ...task,
    subTasks: [...task.subTasks, nextSubTask],
    modifiedAt: now
  }));

  return {
    ...result,
    subTask: result.isUpdated ? nextSubTask : null
  };
}

export async function updateSubTaskTitle(taskId: string, subTaskId: string, title: string) {
  const nextTitle = title.trim();
  if (!nextTitle) {
    return {
      isUpdated: false,
      task: null
    };
  }

  const now = new Date().toISOString();
  const result = await patchTask(taskId, (task) => {
    const exists = task.subTasks.some((subTask) => subTask.id === subTaskId);
    if (!exists) return task;

    const nextSubTasks = task.subTasks.map((subTask) => {
      if (subTask.id !== subTaskId) return subTask;
      if (subTask.title === nextTitle) return subTask;
      return {
        ...subTask,
        title: nextTitle,
        modifiedAt: now
      };
    });

    return {
      ...task,
      subTasks: nextSubTasks,
      modifiedAt: now
    };
  });

  return {
    isUpdated: result.isUpdated,
    task: result.task
  };
}

export async function markSubTaskCompleted(taskId: string, subTaskId: string) {
  const now = new Date().toISOString();
  const result = await patchTask(taskId, (task) => {
    const exists = task.subTasks.some((subTask) => subTask.id === subTaskId);
    if (!exists) return task;
    const nextSubTasks: Task["subTasks"] = task.subTasks.map((subTask) => {
      if (subTask.id !== subTaskId) return subTask;
      return {
        ...subTask,
        mark: "completed",
        modifiedAt: now
      };
    });
    return {
      ...task,
      subTasks: nextSubTasks,
      modifiedAt: now
    };
  });

  return {
    isUpdated: result.isUpdated,
    task: result.task
  };
}

export async function toggleSubTaskMark(taskId: string, subTaskId: string) {
  const now = new Date().toISOString();
  const result = await patchTask(taskId, (task) => {
    const exists = task.subTasks.some((subTask) => subTask.id === subTaskId);
    if (!exists) return task;

    const nextSubTasks: Task["subTasks"] = task.subTasks.map((subTask) => {
      if (subTask.id !== subTaskId) return subTask;
      const nextMark: "todo" | "none" = subTask.mark === "todo" ? "none" : "todo";
      return {
        ...subTask,
        mark: nextMark,
        modifiedAt: now
      };
    });

    return {
      ...task,
      subTasks: nextSubTasks,
      modifiedAt: now
    };
  });

  return {
    isUpdated: result.isUpdated,
    task: result.task
  };
}

export async function deleteSubTask(taskId: string, subTaskId: string) {
  const now = new Date().toISOString();
  const result = await patchTask(taskId, (task) => {
    const nextSubTasks = task.subTasks.filter((subTask) => subTask.id !== subTaskId);
    if (nextSubTasks.length === task.subTasks.length) return task;
    return {
      ...task,
      subTasks: nextSubTasks,
      modifiedAt: now
    };
  });

  return {
    isUpdated: result.isUpdated,
    task: result.task
  };
}
