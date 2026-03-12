import { describe, expect, it } from "vitest";

import {
  buildWorkspaceFiles,
  getSourceCode,
  resolveTestStateIdFromCode,
} from "./demo-data";

describe("resolveTestStateIdFromCode", () => {
  it("keeps the demo in state 1 when the label is still hardcoded", () => {
    const files =
      buildWorkspaceFiles(`export function ContinueButton(props: TButtonProps) {
  return <button className="cta">Submit</button>;
}`);

    expect(resolveTestStateIdFromCode(getSourceCode(files))).toBe("state-1");
  });

  it("moves to state 2 when the label is fixed but click is not wired", () => {
    const files =
      buildWorkspaceFiles(`export function ContinueButton(props: TButtonProps) {
  return <button className="cta">{props.label}</button>;
}`);

    expect(resolveTestStateIdFromCode(getSourceCode(files))).toBe("state-2");
  });

  it("moves to state 3 when both label and click handler are wired", () => {
    const files =
      buildWorkspaceFiles(`export function ContinueButton(props: TButtonProps) {
  return <button className="cta" onClick={props.onClick}>{props.label}</button>;
}`);

    expect(resolveTestStateIdFromCode(getSourceCode(files))).toBe("state-3");
  });
});
