import { useState, useEffect, type KeyboardEvent } from "react";
import { playClickSound } from "../shared/utils/clickSound";
import { playBipSound } from "../shared/utils/enterSound";
import { loadData, saveData } from "../shared/utils/storage";
import type { LogData } from "../shared/type";

export default function DashboardPage() {
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

  async function updateData(logToSave: LogData[] = log) {
    const today = new Date().toDateString();
    const data = await loadData();
    data.today = {
      date: today,
      title: titleValue,
      targetLog,
      log: logToSave,
      bLevel: logToSave.length / targetLog * 100
    }

    console.log(data.today)
    console.log('runned')
    await saveData(data);
  }

  function triggerCancelArmed(){
    setCancelArmed(true);
    setTimeout(() => {
      setCancelArmed(false);
    }, 100)
  }

  function handleLogEnter(e: KeyboardEvent<HTMLInputElement>){
    if(e.key === "Enter"){    
      if(!logInput){
        triggerCancelArmed();
        return;
      }
      if(!isLogEnterArmed){
        playBipSound();
        setIsLogEnterArmed(true);
        return;
      }
  
      playBipSound();
      addLog(logInput);
      setIsLogEnterArmed(false);
    }
    if(e.key === "Escape"){
      if(isLogEnterArmed){
        triggerCancelArmed();
        setIsLogEnterArmed(false);
        return;
      }
    }
  }
  
  function addLog(content: string){
    const newLog: LogData = {
      content,
      createdAt: new Date().toDateString()
    }
    const nextLog = [...log, newLog];
    setLog(nextLog);
    setBLevel(nextLog.length / targetLog * 100);
    updateData(nextLog);

    setLogInput("");
  }

  async function startButtonHandler() {
    playClickSound();
    setIsActive(true);
    setSection(0);
    updateData();
  }

  const panel =
    "p-3 bg-[rgb(246,246,246)] border-[3px] border-black  border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)]";

  const button =
    "bg-[rgb(246,246,246)] border-2 border-black px-3 py-1 border-t-[rgb(223,223,223)] border-l-[rgb(223,223,223)] active:translate-y-px active:shadow-inner outline-none " +
    "active:border-b-[rgb(223,223,223)] active:border-r-[rgb(223,223,223)] active:border-t-black active:border-l-black";

  useEffect(() => {
    
    const init = async () => {
      const data = await loadData();
      const today = new Date().toDateString();

      if(data.today.date === today) {
        setIsActive(true);
        setTitleValue(data.today.title || "");
        setBLevel(data.today.bLevel || 0);
        setTargetLog(data.today.targetLog || 0);
        setLog(data.today.log || []);
        console.log("Same Day")
      } else {
        // new day
        // store the history data first
        data.history.push(data.today);
        // then null the data.today
        data.today = null;
        await saveData(data);
      }
    };

    init();
  }, []);

  return (
    <div className="m-2 flex flex-col gap-2">
      {isActive ? (
        <>
          <div className={panel}>
            <div className="flex justify-between">
              <h4 className="mb-2">Battery Box: {bLevel}%</h4>
              <h4 className="mb-2">[{titleValue}]</h4>
            </div>

            <div className="flex items-center justify-center gap-1 p-2">
              <div className="w-2.5 h-10 bg-[rgb(79,79,79)]" />

              <div className="w-full h-12 border-4 border-b-[rgb(223,223,223)] border-r-[rgb(223,223,223)]">
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
              <span className={bLevel > 200? "text-red-600" : ""}>{log.length || 0}</span>/{targetLog} log {bLevel > 200? "[You're overdoing it]" : ""}
            </h4>
            <div className="flex">
              <input 
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="press ⏎ 2 times to knit"
                type="text"
                onKeyDown={handleLogEnter}
                readOnly={isLogEnterArmed}
                className={`border border-black px-2 py-1 w-full outline-none ${isLogEnterArmed? 'bg-[#006975] text-white' : ''} ${cancelArmed? 'bg-red-800' : ''}`}
              />
            </div>
            <h4 className="mt-2">
              {log.length? log[log.length-1].content : 'no log yet.'} ⏎ 
            </h4>
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

                <div className="flex gap-2 items-center">
                  <input
                    className="border border-black px-2 py-1 w-[35em] outline-none"
                    placeholder="input your task"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
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

                <div className="flex gap-2 items-center">
                  <input
                    className="border border-black px-2 py-1 w-[10em] outline-none"
                    value={targetLog}
                    onChange={(e) =>
                      setTargetLog(parseInt(e.target.value) || 0)
                    }
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
							<>
								<button
									className={button}
									onClick={() => {
                    playClickSound();
                    if (titleValue.trim() === "") {
                      setTimeout(() => {
                        setMandatoryBreak(false);
                      }, 100);
                      setTimeout(() => {
                        setMandatoryBreak(true);
                      }, 150);
                      return;
                    }
                    setMandatoryBreak(false);  
										setSection(2);
									}}
								>
									Next → 
								</button>
							</>
						) : section === 2 ? (
							<>
								<button
									className={button}
									onClick={() => {
										playClickSound();
                    setMandatoryBreak(false)
										setSection(1);
									}}
								>
									← Back
								</button>

								<button
									className={button}
									onClick={() => {
                    playClickSound();
                    if (targetLog <= 0) {
                      setTimeout(() => {
                        setMandatoryBreak(false);
                      }, 100);
                      setTimeout(() => {
                        setMandatoryBreak(true);
                      }, 150);
                      return;
                    }
                    setMandatoryBreak(false);
										setSection(3);
									}}
								>
									Confirm 
								</button>
							</>
						) : (
              <>
                <button
                  className={button}
                  onClick={() => {
                    playClickSound();
                    setSection(2);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={button}
                  onClick={() => {
                    startButtonHandler();
                  }}
                >
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
