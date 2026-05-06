import Panel from "./Panel";
import type { Task } from "../shared/type";

type TaskListPanelProps = {
  title: string;
  description: string;
  urgency: Task["urgency"];
  className?: string;
  isSelected: boolean;
  isArmed: boolean;
  todoSubTasks: number;
  activeSubTasks: number;
};

const urgencyIndicatorClass: Record<Task["urgency"], string> = {
  none: "bg-blue-500",
  low: "bg-green-500",
  medium: "bg-yellow-400",
  high: "bg-red-500",
};

const urgencyChevronClass: Record<Task["urgency"], string> = {
  none: "text-blue-600",
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};

export default function TaskListPanel({
  title,
  description,
  urgency,
  className = "",
  isSelected,
  isArmed,
  todoSubTasks,
  activeSubTasks
}: TaskListPanelProps) {
  const selectedStyle = isSelected ? "bg-black/[0.07]" : "border-l-white";
  const armedStyle = isArmed ? "" : "";

  const displayTitle = title.length > 50 ? `${title.slice(0, 45)}…` : title;
  const displayDescription =
    description.length > 50 ? `${description.slice(0, 50)}…` : description;

  return (
    <Panel className={`min-w-0 p-3 border-l-4 ${className} ${selectedStyle} ${armedStyle}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`text-sm font-bold ${urgencyChevronClass[urgency]}`}>
            {isSelected ? ">" : ""}
          </span>
          <p className={`truncate text-sm ${isSelected ? "font-bold" : "font-medium"}`}>{displayTitle}</p>
        </div>
        <div
          className="flex items-center gap-1 text-[11px] text-gray-500"
          aria-label={`${activeSubTasks} active and ${todoSubTasks} todo subtasks`}
        >
          <span className={activeSubTasks > 0 ? "text-gray-700" : "text-gray-400"}>A:{activeSubTasks}</span>
          <span className="text-gray-400">·</span>
          <span className={todoSubTasks > 0 ? "text-lime-700" : "text-gray-400"}>T:{todoSubTasks}</span>
        </div>
        <span
          aria-label={`${urgency} urgency`}
          className={`h-3 w-4 shrink-0 border border-black ${urgencyIndicatorClass[urgency]}`}
        />
      </div>
      {description ? (
        <p className={`mt-1 line-clamp-2 text-xs text-gray-700 ${isSelected ? "ml-5" : ""}`}>
          {displayDescription}
        </p>
      ) : null}
    </Panel>
  );
}
