import { useViewHints } from "../context/ViewHintsContext";

type ViewHintProps = {
  children: React.ReactNode;
  className?: string;
};

export default function ViewHint({ children, className = "" }: ViewHintProps) {
  const { enabled } = useViewHints();
  if (!enabled) return null;

  return (
    <div className={`text-xs text-gray-700 ${className}`}>
      <div className="flex flex-wrap gap-1 justify-center items-center text-center">
        {children}
      </div>
    </div>
  );
}
