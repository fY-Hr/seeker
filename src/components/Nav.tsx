import { playClickSound } from "../shared/utils/clickSound";

type NavProp = {
  redirect: (destination: string) => void;
};

export default function Nav({ redirect }: NavProp) {
  const button =
    "px-3 py-1 border-2 border-black border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] bg-[rgb(246,246,246)] outline-none " +
    "active:translate-y-px active:shadow-inner active:border-b-[rgb(223,223,223)] active:border-r-[rgb(223,223,223)] active:border-t-black active:border-l-black";

  return (
    <nav
      className="
        flex 
        bg-[rgb(240,240,240)]
        border-b border-black
      "
    >
      <button
        className={button}
        onClick={() => {
          redirect("main");
          playClickSound();
        }}
      >
        Main
      </button>

      <button
        className={button}
        onClick={() => {
          redirect("bbox");
          playClickSound();
        }}
      >
        B-box
      </button>
    </nav>
  );
}
