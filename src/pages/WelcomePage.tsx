import { useState, useEffect } from "react";
import { loadSettings, saveSettings } from "../shared/utils/settings";
import { playBipSound } from "../shared/utils/enterSound";

type WelcomePageProps = {
  onModeSelected: (mode: "trackup" | "buildup") => void;
};

export default function WelcomePage({ onModeSelected }: WelcomePageProps) {
  const [isEntered, setIsEntered] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"trackup" | "buildup" | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEntered) {
        if (e.key === "Tab" && isEntered) {
          e.preventDefault();
          selectedMode === "trackup" ? setSelectedMode("buildup") : setSelectedMode("trackup");
        }

        if (e.key === "Enter" && selectedMode) {
          playBipSound();
          (async () => {
            const current = await loadSettings();
            await saveSettings({ ...current, mode: selectedMode });
            onModeSelected(selectedMode);
          })();
        }
      } else {
        if (e.key === "Enter") {
          playBipSound();
          setIsEntered(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMode, isEntered, onModeSelected]);

  return (
    <>
      {isEntered ? (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
          <h1 className="text-2xl">
            What mode would you want to use<span className="blink">?</span>
          </h1>
          <div className="flex gap-2">
            <div>
              <div
                className={
                  selectedMode === "trackup"
                    ? "mr-4 cursor-pointer border-2 border-blue-300 px-4 py-2 outline-2 outline-blue-400"
                    : "mr-4 cursor-pointer border-2 border-black px-4 py-2"
                }
                onClick={() => {
                  setSelectedMode("trackup");
                }}
              >
                Track-up
              </div>
            </div>
            {/* <div>
              <div
                className={
                  selectedMode === "buildup"
                    ? "mr-4 cursor-pointer border-2 border-blue-300 px-4 py-2 outline-2 outline-blue-400"
                    : "mr-4 cursor-pointer border-2 border-black px-4 py-2"
                }
                onClick={() => {
                  setSelectedMode("buildup");
                }}
              >
                Build-up
              </div>
            </div> */}
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
          <h1 className="text-2xl">
            Welcome to Seeker<span className="">!</span>
          </h1>
          <h2 className="blink">[press enter]</h2>
        </div>
      )}
    </>
  );
}
