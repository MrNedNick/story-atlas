import { describe, expect, it } from "vitest";
import { checkAssets, explainerCss, parseExplainer, stepInputId } from "../../src/domain/04-explainer";
import {
  duplicateSteps,
  longLabel,
  oneStep,
  relativeSrc,
  shorelineExplainer,
  unknownInitial,
} from "../fixtures/04-explainer-fixtures";

function requireExplainer() {
  const result = parseExplainer(shorelineExplainer);
  if (!result.ok) throw new Error("fixture should parse");
  return result.value;
}

describe("parseExplainer", () => {
  it("accepts a step-through and starts on the first step", () => {
    expect(requireExplainer().initial).toBe("1960");
    const withInitial = parseExplainer({ ...shorelineExplainer, initial: "2014" });
    expect(withInitial.ok && withInitial.value.initial).toBe("2014");
  });

  it.each([
    [oneStep, /at least two steps/],
    [duplicateSteps, /duplicate step id "1960"/],
    [unknownInitial, /initial step "1999"/],
    [longLabel, /fit a button/],
    [relativeSrc, /steps\.0\.src/],
  ])("rejects %#: %s", (input, message) => {
    const result = parseExplainer(input);
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === "invalid-explainer") expect(result.error.issues.join(" ")).toMatch(message);
  });
});

describe("checkAssets", () => {
  it("passes when every step's image exists", () => {
    expect(checkAssets(requireExplainer(), () => true).ok).toBe(true);
  });

  it("names the explainer and every missing file", () => {
    const present = new Set(["/stories/aral-sea/step-1960.svg"]);
    expect(checkAssets(requireExplainer(), (src) => present.has(src))).toEqual({
      ok: false,
      error: {
        kind: "missing-asset",
        explainer: "aral-shoreline",
        src: ["/stories/aral-sea/step-1980s.svg", "/stories/aral-sea/step-2014.svg"],
      },
    });
  });
});

describe("explainerCss", () => {
  const css = explainerCss(requireExplainer());

  it("shows the panel of the checked step only", () => {
    expect(css).toContain('[data-explainer="aral-shoreline"]:has(input:checked) .explainer-panel {\n  display: none;');
    expect(css).toContain(
      `[data-explainer="aral-shoreline"]:has(#${stepInputId("aral-shoreline", "late-1980s")}:checked) .explainer-panel[data-step="late-1980s"] {\n  display: block;`,
    );
  });

  it("never hides panels unless a step is checked, so every state stays readable without the CSS", () => {
    expect(css).not.toMatch(/^\.explainer-panel\s*\{/m);
  });

  it("uses ids that are valid CSS selectors", () => {
    expect(stepInputId("aral-shoreline", "1960")).toBe("explainer-aral-shoreline-1960");
  });
});
