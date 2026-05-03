type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Panel({ children, className = "" }: PanelProps) {
  const panel =
    "bg-[rgb(246,246,246)] border-3 border-black border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)]";

  return <section className={`${panel} ${className}`}>{children}</section>;
}
