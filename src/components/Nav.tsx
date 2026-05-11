import NavButton from "./NavButton";
import { playClickSound } from "../shared/utils/clickSound";

type NavProp = {
  navTitle: string;
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
};

export default function Nav({ navTitle, page, setPage }: NavProp) {
  function changePage(target: string): void {
    setPage(target);
    playClickSound();
  }

  return (
    <nav className="flex shrink-0 bg-[rgb(240,240,240)] border-b border-black">
      <div className="flex items-center">
        <NavButton aria-label="Task list" onClick={() => changePage("task-list")} isCurrentPage={page === "task-list"}>
          <img src="/icons/list.svg" alt="Task list" className="h-5 w-5 shrink-0" />
        </NavButton>
        <NavButton onClick={() => changePage("main")} isCurrentPage={page === "main"}>Main</NavButton>
        <NavButton onClick={() => changePage("settings")} isCurrentPage={page === "settings"}>
            <img src="/icons/settings.svg" alt="Settings" className="w-5 shrink-0" />
        </NavButton>
      </div>
      <div className="text-sm flex items-center justify-center flex-1">
        <h1 className="">{navTitle}</h1>
      </div>
    </nav>
  );
}
