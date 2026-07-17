// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { isEditableTarget } from "./keyboard";

describe("keyboard helpers", () => {
  it("detects editable targets", () => {
    expect(isEditableTarget(document.createElement("input"))).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);

    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    expect(isEditableTarget(editable)).toBe(true);
  });

  it("does not treat links and buttons as editable", () => {
    expect(isEditableTarget(document.createElement("a"))).toBe(false);
    expect(isEditableTarget(document.createElement("button"))).toBe(false);
  });
});
