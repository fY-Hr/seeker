import Panel from "./Panel";
import type { Task } from "../shared/type";

type TaskListPanelProps = {
  title: string;
  description: string;
  urgency: Task["urgency"];
  className?: string;
  isSelected: boolean;
  isArmed: boolean;
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
}: TaskListPanelProps) {
  const selectedStyle = isSelected ? "bg-black/[0.07]" : "border-l-white";
  const armedStyle = isArmed ? "" : "";

  const displayTitle = title.length > 50 ? `${title.slice(0, 45)}…` : title;
  const displayDescription =
    description.length > 50 ? `${description.slice(0, 50)}…` : description;

  return (
    <Panel className={`min-w-0 p-3 border-l-4 ${className} ${selectedStyle} ${armedStyle}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`text-sm font-bold ${urgencyChevronClass[urgency]}`}>
            {isSelected ? ">" : ""}
          </span>
          <p className={`truncate text-sm ${isSelected ? "font-bold" : "font-medium"}`}>{displayTitle}</p>
        </div>
        <span
          aria-label={`${urgency} urgency`}
          className={`h-3 w-3 shrink-0 border border-black ${urgencyIndicatorClass[urgency]}`}
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
