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

export async function createMultiSubTasks(taskId: string, rawTitles: string, replaceSubTaskId?: string) {
  const titles = rawTitles.split(/\r?\n/g).map((title) => title.trim()).filter((title) => title.length > 0);

  if (titles.length === 0) {
    return {
      isUpdated: false,
      task: null,
      subTasks: [] as SubTask[]
    };
  }

  const now = new Date().toISOString();
  const newSubTasks: SubTask[] = titles.map((title) => ({
    id: crypto.randomUUID(),
    title,
    mark: "none",
    createdAt: now,
    modifiedAt: now
  }));

  const result = await patchTask(taskId, (task) => {
    if (!replaceSubTaskId) {
      return {
        ...task,
        subTasks: [...task.subTasks, ...newSubTasks],
        modifiedAt: now
      };
    }

    const replaceIndex = task.subTasks.findIndex((subTask) => subTask.id === replaceSubTaskId);
    if (replaceIndex < 0) return task;

    return {
      ...task,
      subTasks: [
        ...task.subTasks.slice(0, replaceIndex),
        ...newSubTasks,
        ...task.subTasks.slice(replaceIndex + 1)
      ],
      modifiedAt: now
    };
  });

  return {
    isUpdated: result.isUpdated,
    task: result.task,
    subTasks: result.isUpdated ? newSubTasks : []
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
