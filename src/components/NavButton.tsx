type NavButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isCurrentPage?: boolean;
};

const baseButton =
  "border-2 bg-[rgb(246,246,246)] px-3 py-1 text-sm flex items-center justify-center gap-1 outline-none";

const raisedBorders =
  "border-black border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] " +
  "hover:bg-[rgb(238,238,238)] " +
  "active:translate-y-px active:shadow-inner active:bg-[rgb(230,230,230)] " +
  "active:border-t-black active:border-l-black active:border-b-[rgb(223,223,223)] active:border-r-[rgb(223,223,223)]";

const insetBorders =
  "translate-y-px shadow-inner bg-[rgb(238,238,238)] " +
  "border-t-black border-l-black border-b-[rgb(223,223,223)] border-r-[rgb(223,223,223)]";

export default function NavButton({
  children,
  onClick,
  className = "",
  isCurrentPage = false,
}: NavButtonProps) {
  return (
    <button
      type="button"
      className={`${baseButton} ${isCurrentPage ? insetBorders : raisedBorders} ${className}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.currentTarget.blur();
        onClick();
      }}
    >
      {children}
    </button>
  );
}
