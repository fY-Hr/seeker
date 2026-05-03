type NavButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  "aria-label"?: string;
};

const retroButton =
  "border-2 border-black border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] bg-[rgb(246,246,246)] px-3 py-1 text-sm outline-none " +
  "active:translate-y-px active:border-b-[rgb(223,223,223)] active:border-r-[rgb(223,223,223)] active:border-t-black active:border-l-black active:shadow-inner";

export default function NavButton({ children, onClick, className = "", ...props }: NavButtonProps) {
  return (
    <button
      type="button"
      className={`${retroButton} flex items-center justify-center gap-1 ${className}`}
      {...props}
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
