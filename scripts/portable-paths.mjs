/**
 * Cross-platform path policy for submission files and generated ZIP entries.
 *
 * GitHub Actions builds on Linux, but contributors commonly clone and extract
 * bundles on case-insensitive macOS/Windows filesystems. Reject spellings that
 * can alias, traverse, or become device paths on those platforms before they
 * are committed or passed to a ZIP library.
 */

const WINDOWS_DEVICE_NAMES = new Set([
  "aux",
  "con",
  "conin$",
  "conout$",
  "nul",
  "prn",
  ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`),
  ...["¹", "²", "³"].flatMap((digit) => [`com${digit}`, `lpt${digit}`]),
]);

function pathError(label, path, reason) {
  throw new Error(`${label} contains unsafe path "${path}": ${reason}`);
}

/** Build a Unicode compatibility case-fold key for portable path comparison. */
function portableCaseFold(value) {
  // JavaScript has no CaseFolding.txt API. Compatibility normalization plus a
  // lower/upper/lower closure covers multi-code-point folds such as ß/ss,
  // capital sharp s, final sigma, long s, and presentation ligatures that
  // collide on common macOS volumes. This is an equality key, not display text.
  return value
    .normalize("NFKC")
    .toLowerCase()
    .toUpperCase()
    .toLowerCase()
    .normalize("NFKC");
}

/** Return a deterministic case-folded key after validating every component. */
export function portablePathKey(path, label = "submission") {
  if (typeof path !== "string" || !path || path.startsWith("/") || path.endsWith("/")) {
    pathError(label, String(path), "paths must be non-empty relative file paths");
  }
  if (path.includes("\\")) {
    pathError(label, path, "backslashes are not portable path separators");
  }

  const segments = path.split("/");
  const folded = [];
  for (const segment of segments) {
    if (!segment || segment === "." || segment === "..") {
      pathError(label, path, "empty, dot, and parent path components are forbidden");
    }
    if (/[\u0000-\u001f\u007f<>:"|?*]/.test(segment)) {
      pathError(label, path, "contains control characters or Windows-reserved punctuation");
    }
    if (/[. ]$/.test(segment)) {
      pathError(label, path, "components may not end in a dot or space");
    }

    const normalized = portableCaseFold(segment);
    const deviceStem = normalized.split(".", 1)[0];
    if (normalized === ".git" || WINDOWS_DEVICE_NAMES.has(deviceStem)) {
      pathError(label, path, `"${segment}" is a reserved path component`);
    }
    folded.push(normalized);
  }
  return folded.join("/");
}

/**
 * Reject file/file, file/directory, case-fold, and Unicode-normalization aliases.
 * Directory aliases are checked too (for example `Assets/a` plus `assets/b`).
 */
export function assertUniquePortablePaths(paths, label = "submission") {
  const entries = new Map();

  for (const path of paths) {
    const key = portablePathKey(path, label);
    const originalSegments = path.split("/");
    const keySegments = key.split("/");

    for (let length = 1; length < originalSegments.length; length += 1) {
      const originalDirectory = originalSegments.slice(0, length).join("/");
      const directoryKey = keySegments.slice(0, length).join("/");
      const previous = entries.get(directoryKey);
      if (
        previous &&
        (previous.kind !== "directory" || previous.original !== originalDirectory)
      ) {
        throw new Error(
          `${label} has a portable path collision between "${previous.original}" and ` +
            `"${originalDirectory}"`,
        );
      }
      entries.set(directoryKey, { kind: "directory", original: originalDirectory });
    }

    const previous = entries.get(key);
    if (previous) {
      throw new Error(
        `${label} has a portable path collision between "${previous.original}" and "${path}"`,
      );
    }
    entries.set(key, { kind: "file", original: path });
  }
}
