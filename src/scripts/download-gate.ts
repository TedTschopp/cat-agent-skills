document.querySelectorAll<HTMLElement>("[data-download-gate]").forEach((gate) => {
  if (gate.dataset.enhanced === "true") return;
  gate.dataset.enhanced = "true";

  const acknowledgment = gate.querySelector<HTMLInputElement>("[data-trust-ack]");
  const links = Array.from(
    gate.querySelectorAll<HTMLAnchorElement>("[data-download-gated]"),
  );
  if (!acknowledgment || links.length === 0) return;

  const lockedClasses = ["pointer-events-none", "cursor-not-allowed", "opacity-50"];
  const sync = (): void => {
    links.forEach((link) => {
      lockedClasses.forEach((className) =>
        link.classList.toggle(className, !acknowledgment.checked),
      );
      if (acknowledgment.checked) link.removeAttribute("aria-disabled");
      else link.setAttribute("aria-disabled", "true");
    });
  };

  gate.addEventListener("click", (event) => {
    if (acknowledgment.checked) return;
    const target = event.target;
    if (!(target instanceof Element) || !target.closest("[data-download-gated]")) return;
    event.preventDefault();
    acknowledgment.focus();
  });
  acknowledgment.addEventListener("change", sync);
  sync();
});
