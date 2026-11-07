// Vite-only manual QA fixture. Not an application entry or part of the Pages build.
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { emptyState, upgradeState } from "../src/engine/progress";
import { newBrainRun } from "../src/games/brain";
import type { Level } from "../src/games/brain";
import { WORKSHOP_IDS, WORKSHOP_TITLES } from "../src/games/workshop";
import type { WorkshopId } from "../src/games/workshop";
import { Workshop } from "../src/ui/brain/Workshop";
import "../src/index.css";
function QA() {
  const [state, setState] = useState(() => {
      try {
        const r = upgradeState(
          JSON.parse(localStorage.getItem("workshop-qa") ?? "null"),
        );
        return r.ok ? r.state : emptyState();
      } catch {
        return emptyState();
      }
    }),
    [id, setId] = useState<WorkshopId>("water-pipes");
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    localStorage.setItem("workshop-qa", JSON.stringify(state));
  }, [state]);
  return (
    <>
      <button className="growth-secondary" onClick={() => setNarrow(!narrow)}>
        {narrow ? "Desktop layout" : "320px layout"}
      </button>
      <nav className="flex flex-wrap gap-2 p-3" aria-label="QA game selection">
        {WORKSHOP_IDS.map((x) => (
          <button
            className="growth-secondary"
            key={x}
            onClick={() => {
              setId(x);
              setState((s) =>
                s.brainRuns?.[x]
                  ? s
                  : {
                      ...s,
                      brainRuns: { ...s.brainRuns, [x]: newBrainRun(x, 1, 25) },
                    },
              );
            }}
          >
            {WORKSHOP_TITLES[x]}
          </button>
        ))}
        {([1, 2, 3] as Level[]).map((level) => (
          <button
            className="growth-secondary"
            key={level}
            onClick={() =>
              setState((s) => ({
                ...s,
                brainRuns: { ...s.brainRuns, [id]: newBrainRun(id, level, 25) },
              }))
            }
          >
            Reset level {level}
          </button>
        ))}
      </nav>
      <div
        aria-label="QA game frame"
        style={{
          width: narrow ? 320 : "100%",
          maxWidth: "100%",
          margin: "auto",
        }}
      >
        <Workshop id={id} state={state} update={setState} onExit={() => {}} />
      </div>
      <output className="block p-3" aria-label="QA results">
        {JSON.stringify(state.games)}
      </output>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<QA />);
