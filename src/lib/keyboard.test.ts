// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { isEditableTarget, isInteractiveTarget } from "./keyboard";

describe("keyboard helpers", () => {
  it("detects editable targets", () => {
    expect(isEditableTarget(document.createElement("input"))).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);

    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    expect(isEditableTarget(editable)).toBe(true);
  });

  it("detects interactive targets", () => {
    const wrapper = document.createElement("div");
    const button = document.createElement("button");
    const label = document.createElement("span");
    button.append(label);
    wrapper.append(button);

    expect(isInteractiveTarget(label)).toBe(true);
    expect(isInteractiveTarget(document.createElement("div"))).toBe(false);
  });
});
