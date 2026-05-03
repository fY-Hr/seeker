import Panel from "../components/Panel";
import { useViewHints } from "../context/ViewHintsContext";
import { playClickSound } from "../shared/utils/clickSound";

export default function SettingsPage() {
  const { enabled, setEnabled } = useViewHints();

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="w-fit -mt-2 border-x-2 border-b-2 bg-[rgb(246,246,246)] px-2 py-1 text-sm">Settings</h1>
          </div>
        </div>
      </section>

      <Panel className="flex flex-row flex-nowrap items-center gap-3 px-3 py-2">
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className="font-medium text-black">View hints</span>
          <span className="text-gray-500"> — </span>
          <span className="text-xs text-gray-600">Keyboard shortcuts bar on task list, editor, and main.</span>
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "View hints on" : "View hints off"}
          onClick={() => {
            playClickSound();
            setEnabled(!enabled);
          }}
          className={`
            relative flex h-7 w-11 shrink-0 cursor-pointer items-center rounded-none border-2 border-black px-0.5 outline-none
            border-b-[rgb(223,223,223)] border-r-[rgb(223,223,223)]
            transition-colors duration-150 ease-out
            ${enabled ? "justify-end bg-green-600" : "justify-start bg-[rgb(220,220,220)]"}
          `}
        >
          <span
            aria-hidden
            className="pointer-events-none h-5 w-5 shrink-0 rounded-none border border-black border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          />
        </button>
      </Panel>
    </div>
  );
}
