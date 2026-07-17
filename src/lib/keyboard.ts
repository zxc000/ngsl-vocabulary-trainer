export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    target.closest("[contenteditable='true']") !== null ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}
