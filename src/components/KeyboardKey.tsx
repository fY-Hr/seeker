type KeyboardKeyProps = {
  children: React.ReactNode;
  className?: string;
};

export default function KeyboardKey({ children, className = "" }: KeyboardKeyProps) {
  return (
    <kbd
      className={`
        inline-flex min-h-[1.2em] select-none items-center justify-center
        text-sm
        rounded-none
        border border-black
        bg-[rgb(246,246,246)]
        px-1.5 py-0.5
        text-[11px] font-medium leading-none text-black
        ${className}
      `}
    >
      {children}
    </kbd>
  );
}
