import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { emptyState } from "../../src/engine/progress";
import { Games } from "../../src/ui/games/Games";
import { TinkerApp } from "../../src/logicLab/games/tinker/TinkerApp";
import { App as LogicLab } from "../../src/logicLab/App";

describe("Logic Lab portal integration", () => {
  it("offers the lab through Brain Games and a return to Brain Games in the lab", () => {
    const noop = () => {};
    const games = renderToStaticMarkup(
      <Games
        state={emptyState()}
        onBack={noop}
        onPlay={noop}
        onLogicLab={noop}
        onTinker={noop}
      />,
    );
    for (const title of [
      "Logic Lab",
      "Dots and Boxes",
      "Water Rescue",
      "Shape Builder",
    ])
      expect(games).toContain(title);
    for (const id of ["dots-boxes", "water-pipes", "shape-builder"] as const) {
      const markup = renderToStaticMarkup(
        <TinkerApp id={id} onExit={noop} muted onMutedChange={noop} />,
      );
      expect(markup).toContain("Brain Games");
      expect(markup).toContain("Hear how to play");
    }

    const lab = renderToStaticMarkup(
      <LogicLab onExit={noop} muted={true} onMutedChange={noop} />,
    );
    expect(lab).toContain("Brain Games");
    expect(lab).toContain("GearWorks");
    expect(lab).toContain("Play puzzle 1");
    // The child sees no level editor, and the unfinished GravityBuilder stays hidden.
    expect(lab).not.toContain("Level editor");
    expect(lab).not.toContain("GravityBuilder");
  });
  it("scopes lab styles so they cannot alter portal elements", () => {
    const css =
      readFileSync("src/logicLab/style.css", "utf8") +
      readFileSync("src/logicLab/games/tinker/tinker.css", "utf8");
    const root = postcss.parse(css);
    root.walkRules((rule) => {
      if (
        rule.parent?.type === "atrule" &&
        rule.parent.name.endsWith("keyframes")
      )
        return;
      for (const selector of rule.selectors)
        expect(selector.startsWith(".logic-lab"), selector).toBe(true);
    });
  });
});
