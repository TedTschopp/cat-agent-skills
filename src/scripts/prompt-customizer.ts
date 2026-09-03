type PromptControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const customizers = document.querySelectorAll<HTMLElement>("[data-prompt-customizer]");

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

customizers.forEach((customizer) => {
  if (customizer.dataset.enhanced === "true") return;
  customizer.dataset.enhanced = "true";

  const source = customizer.querySelector<HTMLTextAreaElement>("[data-prompt-template]");
  const output = customizer.querySelector<HTMLTextAreaElement>("[data-prompt-output]");
  const form = customizer.querySelector<HTMLFormElement>("[data-prompt-form]");
  const controls = Array.from(
    customizer.querySelectorAll<PromptControl>("[data-prompt-variable]"),
  );
  const reset = customizer.querySelector<HTMLButtonElement>("[data-prompt-reset]");
  const copy = customizer.querySelector<HTMLButtonElement>("[data-copy-prompt]");
  const download = customizer.querySelector<HTMLButtonElement>(
    "[data-download-customized]",
  );
  const providerLinks = Array.from(
    customizer.querySelectorAll<HTMLAnchorElement>("[data-open-provider]"),
  );
  const status = customizer.querySelector<HTMLElement>("[data-prompt-status]");
  const count = customizer.querySelector<HTMLElement>("[data-prompt-character-count]");

  if (!source || !output) return;
  const template = source.value;

  const render = (): string => {
    const grouped = new Map<string, PromptControl[]>();
    controls.forEach((control) => {
      const name = control.dataset.promptVariable;
      if (!name) return;
      const group = grouped.get(name) ?? [];
      group.push(control);
      grouped.set(name, group);
    });

    const values = new Map<string, string>();
    grouped.forEach((group, name) => {
      const first = group[0];
      if (first instanceof HTMLInputElement && first.type === "checkbox") {
        values.set(
          name,
          group
            .filter(
              (control): control is HTMLInputElement =>
                control instanceof HTMLInputElement && control.checked,
            )
            .map((control) => control.value)
            .join(", "),
        );
        return;
      }
      if (first instanceof HTMLInputElement && first.type === "radio") {
        const selected = group.find(
          (control): control is HTMLInputElement =>
            control instanceof HTMLInputElement && control.checked,
        );
        values.set(name, selected?.value ?? "");
        return;
      }
      if (first instanceof HTMLSelectElement && first.multiple) {
        values.set(
          name,
          Array.from(first.selectedOptions)
            .map((option) => option.value)
            .join(", "),
        );
        return;
      }
      values.set(name, first?.value ?? "");
    });

    const customized = template.replace(
      /\{\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*\}\}/g,
      (token, name: string) => (values.has(name) ? values.get(name) ?? "" : token),
    );
    output.value = customized;
    if (count) count.textContent = customized.length.toLocaleString("en-US");
    return customized;
  };

  const announce = (message: string): void => {
    if (status) status.textContent = message;
  };

  const updateRequiredCheckboxValidity = (): void => {
    form
      ?.querySelectorAll<HTMLElement>(
        '[data-prompt-checkbox-group][data-prompt-required="true"]',
      )
      .forEach((group) => {
        const checkboxes = Array.from(
          group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        );
        const first = checkboxes[0];
        if (!first) return;
        first.setCustomValidity(
          checkboxes.some((checkbox) => checkbox.checked)
            ? ""
            : "Select at least one option for this required field.",
        );
      });
  };

  const validate = (): boolean => {
    updateRequiredCheckboxValidity();
    if (!form || form.checkValidity()) return true;
    announce("Complete all required prompt fields before continuing.");
    const firstInvalid = form.querySelector<PromptControl>(":invalid");
    firstInvalid?.focus();
    form.reportValidity();
    return false;
  };

  controls.forEach((control) => {
    control.addEventListener("input", () => {
      updateRequiredCheckboxValidity();
      render();
      announce("Customized prompt updated.");
    });
    control.addEventListener("change", () => {
      updateRequiredCheckboxValidity();
      render();
      announce("Customized prompt updated.");
    });
  });

  reset?.addEventListener("click", () => {
    controls.forEach((control) => {
      if (
        control instanceof HTMLInputElement &&
        (control.type === "checkbox" || control.type === "radio")
      ) {
        control.checked = control.defaultChecked;
      } else if (control instanceof HTMLSelectElement) {
        Array.from(control.options).forEach((option) => {
          option.selected = option.defaultSelected;
        });
      } else {
        control.value = control.defaultValue;
      }
    });
    render();
    announce("Customization reset to the published defaults.");
  });

  copy?.addEventListener("click", async () => {
    if (!validate()) return;
    const copied = await copyText(render());
    announce(copied ? "Prompt copied to the clipboard." : "Copy failed. Select the prompt and copy it manually.");
    if (!copied) output.focus();
  });

  providerLinks.forEach((link) => {
    try {
      const destination = new URL(link.href);
      destination.search = "";
      destination.hash = "";
      link.href = destination.href;
    } catch {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
    }

    link.addEventListener("click", (event) => {
      if (!validate()) {
        event.preventDefault();
        return;
      }
      const provider = link.dataset.providerLabel ?? "the provider";
      void copyText(render()).then((copied) => {
        announce(
          copied
            ? `Prompt copied. ${provider} opened without putting the prompt in the URL.`
            : `${provider} opened. Copy the prompt manually from the preview.`,
        );
      });
    });
  });

  download?.addEventListener("click", () => {
    if (!validate()) return;
    const blob = new Blob([render()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = download.dataset.filename || "customized.prompt.md";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    announce("Customized prompt downloaded.");
  });

  render();
});
