const copyText = async (value: string): Promise<boolean> => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Use the selection fallback below.
    }
  }

  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.readOnly = true;
  fallback.style.position = "fixed";
  fallback.style.left = "-9999px";
  document.body.append(fallback);
  fallback.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  fallback.remove();
  return copied;
};

document.querySelectorAll<HTMLElement>("[data-source-copy]").forEach((region) => {
  if (region.dataset.enhanced === "true") return;
  region.dataset.enhanced = "true";

  const button = region.querySelector<HTMLButtonElement>("[data-copy-source]");
  const source = region.querySelector<HTMLElement>("[data-source-content]");
  const status = region.querySelector<HTMLElement>("[data-copy-source-status]");
  if (!button || !source) return;

  button.addEventListener("click", async () => {
    const copied = await copyText(source.textContent ?? "");
    if (status) {
      status.textContent = copied
        ? "Source copied to the clipboard."
        : "Copy failed. The source is selected so you can copy it manually.";
    }
    if (copied) return;

    source.focus();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
  });
});
