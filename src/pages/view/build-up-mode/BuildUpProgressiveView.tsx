import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { playClickSound } from "../../../shared/utils/clickSound";
import { playBipSound } from "../../../shared/utils/enterSound";
import type { Bdata, LogData } from "../../../shared/type";
import { loadData, saveData } from "../../../shared/utils/storage";

export default function BuildUpProgressiveView() {
  const [isActive, setIsActive] = useState(false);

  const [bLevel, setBLevel] = useState(0);
  const [targetLog, setTargetLog] = useState(0);
  const [log, setLog] = useState<LogData[]>([]);

  const [section, setSection] = useState(1);
  const [titleValue, setTitleValue] = useState("");
  const [logInput, setLogInput] = useState("");
  const [isLogEnterArmed, setIsLogEnterArmed] = useState(false);

  const [cancelArmed, setCancelArmed] = useState(false);
  const [mandatoryBreak, setMandatoryBreak] = useState(false);

  function triggerCancelArmed() {
    setCancelArmed(true);
    setTimeout(() => setCancelArmed(false), 100);
  }

  async function updateData(logToSave: LogData[] = log) {
    const dateStr = new Date().toDateString();
    const data = await loadData();
    const prev = data.buildup.today;
    const nextToday: Bdata = {
      id: prev?.id ?? Date.now(),
      date: dateStr,
      title: titleValue,
      targetLog,
      log: logToSave,
      bLevel: targetLog > 0 
        ? Math.min(Math.round((logToSave.length / targetLog) * 100), 999)
        : 0, //To make Battery Percentage not raw float
    };
    data.buildup.today = nextToday;
    await saveData(data);
  }

  function clearMandatoryShake() {
    setTimeout(() => setMandatoryBreak(false), 100);
    setTimeout(() => setMandatoryBreak(true), 150);
  }

  function goNextFromSection1() {
    playClickSound();
    if (titleValue.trim() === "") {
      clearMandatoryShake();
      return;
    }
    setMandatoryBreak(false);
    setSection(2);
  }

  function goBackFromSection2() {
    playClickSound();
    setMandatoryBreak(false);
    setSection(1);
  }

  function goConfirmFromSection2() {
    playClickSound();
    if (targetLog <= 0) {
      clearMandatoryShake();
      return;
    }
    setMandatoryBreak(false);
    setSection(3);
  }

  function cancelFromSection3() {
    playClickSound();
    setSection(2);
  }

  async function startButtonHandler() {
    playClickSound();
    setIsActive(true);
    setSection(0);
    updateData();
  }

  function handleTitleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (e.repeat) return;
    e.preventDefault();
    goNextFromSection1();
  }

  function handleTargetKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (e.repeat) return;
      e.preventDefault();
      goConfirmFromSection2();
      return;
    }
    if (e.key === "Escape") {
      if (e.repeat) return;
      e.preventDefault();
      goBackFromSection2();
    }
  }

  function handleLogEnter(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (e.repeat) return;
      e.preventDefault();
      if (!logInput.trim()) {
        triggerCancelArmed();
        return;
      }
      if (!isLogEnterArmed) {
        playBipSound();
        setIsLogEnterArmed(true);
        return;
      }

      playBipSound();
      addLog(logInput);
      setIsLogEnterArmed(false);
      return;
    }
    if (e.key === "Escape") {
      if (e.repeat) return;
      if (isLogEnterArmed) {
        triggerCancelArmed();
        setIsLogEnterArmed(false);
      }
    }
  }

  function addLog(content: string) {
    const newLog: LogData = {
      content,
      createdAt: new Date().toDateString(),
    };
    const nextLog = [...log, newLog];
    setLog(nextLog);
    setBLevel(targetLog > 0 ? (nextLog.length / targetLog) * 100 : 0);
    updateData(nextLog);

    setLogInput("");
  }

  const panel =
    "p-3 bg-[rgb(246,246,246)] border-[3px] border-black  border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)]";

  const button =
    "bg-[rgb(246,246,246)] border-2 border-black px-3 py-1 border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] active:translate-y-px active:shadow-inner outline-none " +
    "active:border-b-[rgb(223,223,223)] active:border-r-[rgb(223,223,223)] active:border-t-black active:border-l-black";

  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      const todayStr = new Date().toDateString();
      const t = data.buildup.today;

      if (t && t.date === todayStr) {
        setIsActive(true);
        setTitleValue(t.title || "");
        setBLevel(t.bLevel || 0);
        setTargetLog(t.targetLog || 0);
        setLog(t.log || []);
      } else if (t) {
        data.buildup.history = [...(data.buildup.history ?? []), t];
        data.buildup.today = null;
        await saveData(data);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (isActive || section !== 3) return;

    function onSetupConfirmKeys(ev: KeyboardEvent) {
      if (ev.repeat) return;
      if (ev.key === "Enter") {
        ev.preventDefault();
        startButtonHandler();
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        cancelFromSection3();
      }
    }

    window.addEventListener("keydown", onSetupConfirmKeys);
    return () => window.removeEventListener("keydown", onSetupConfirmKeys);
  }, [isActive, section]);

  return (
    <div className="m-2 flex min-h-0 flex-1 flex-col gap-2">
      {isActive ? (
        <>
          <div className={panel}>
            <div className="flex justify-between">
              <h4 className="mb-2">Battery Box: {Math.round(bLevel)}%</h4>
              <h4 className="mb-2">[{titleValue}]</h4>
            </div>

            <div className="flex items-center justify-center gap-1 p-2">
              <div className="h-10 w-2.5 bg-[rgb(79,79,79)]" />

              <div className="h-12 w-full border-4 border-b-[rgb(223,223,223)] border-r-[rgb(223,223,223)]">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${bLevel > 100 ? 100 : bLevel}%`,
                    background:
                      bLevel > 200
                        ? "repeating-linear-gradient(90deg,#b91c1c 0px,#ef4444 17px,transparent 0px,transparent 20px)"
                        : bLevel > 100
                          ? "repeating-linear-gradient(90deg,#ca8a04 0px,#facc15 17px,transparent 0px,transparent 20px)"
                          : "repeating-linear-gradient(90deg,#065d85 0px,#39a099 17px,transparent 0px,transparent 20px)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className={panel}>
            <h4 className="mb-2">
              <span className={bLevel > 200 ? "text-red-600" : ""}>{log.length || 0}</span>/{targetLog} log{" "}
              {bLevel > 200 ? "[You're overdoing it]" : ""}
            </h4>
            <div className="flex">
              <input
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="press ⏎ 2 times to knit"
                type="text"
                onKeyDown={handleLogEnter}
                readOnly={isLogEnterArmed}
                className={`w-full border border-black px-2 py-1 outline-none ${isLogEnterArmed ? "bg-[#006975] text-white" : ""} ${cancelArmed ? "bg-red-800 text-white" : ""}`}
              />
            </div>
            <h4 className="mt-2">{log.length ? log[log.length - 1].content : "no log yet."} ⏎</h4>
          </div>
        </>
      ) : (
        <>
          <div className={panel}>
            {section === 1 ? (
              <div className="flex flex-col gap-2">
                <h4>
                  What is the most important thing today
                  <span className="blink">?</span>
                </h4>

                <div className="flex items-center gap-2">
                  <input
                    className="max-w-full border border-black px-2 py-1 outline-none sm:w-[35em]"
                    placeholder="input your task"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                  />
                  <span className={mandatoryBreak ? "text-red-500 hit-shake" : "text-red-500"}>{mandatoryBreak ? "*" : ""}</span>
                </div>
              </div>
            ) : section === 2 ? (
              <div className="flex flex-col gap-2">
                <h4>
                  How many log do you want to do
                  <span className="blink">?</span>
                </h4>

                <div className="flex items-center gap-2">
                  <input
                    className="w-[10em] border border-black px-2 py-1 outline-none"
                    value={targetLog}
                    onChange={(e) => setTargetLog(parseInt(e.target.value, 10) || 0)}
                    onKeyDown={handleTargetKeyDown}
                  />
                  <span className={mandatoryBreak ? "text-red-500 hit-shake" : "text-red-500"}>{mandatoryBreak ? "*" : ""}</span>
                </div>
              </div>
            ) : (
              <div>
                <h4>
                  Are you sure? you can't change it and must commit to it till the day is finished
                  <span className="blink">.</span>
                </h4>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {section === 1 ? (
              <button type="button" className={button} onClick={goNextFromSection1}>
                Next →
              </button>
            ) : section === 2 ? (
              <>
                <button type="button" className={button} onClick={goBackFromSection2}>
                  ← Back
                </button>

                <button type="button" className={button} onClick={goConfirmFromSection2}>
                  Confirm
                </button>
              </>
            ) : (
              <>
                <button type="button" className={button} onClick={cancelFromSection3}>
                  Cancel
                </button>
                <button type="button" className={button} onClick={startButtonHandler}>
                  Start
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
