import NavButton from "./NavButton";
import { playClickSound } from "../shared/utils/clickSound";

type NavProp = {
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
};

export default function Nav({ page, setPage }: NavProp) {
  function changePage(target: string): void {
    setPage(target);
    playClickSound();
  }

  return (
    <nav className="flex shrink-0 bg-[rgb(240,240,240)] border-b border-black">
      <div className="flex items-center">
        <NavButton aria-label="Task list" onClick={() => changePage("task-list")}>
          <img src="/icons/list.svg" alt="" className="h-5 w-5 shrink-0" />
        </NavButton>
        <NavButton onClick={() => changePage("main")}>Main</NavButton>
        <NavButton aria-label="Settings" onClick={() => changePage("settings")}>
            <img src="/icons/settings.svg" alt="" className="w-5 shrink-0" />
        </NavButton>
      </div>
      <div className="text-sm flex items-center justify-center flex-1">
        <h1 className="">{page}</h1>
      </div>
    </nav>
  );
}
