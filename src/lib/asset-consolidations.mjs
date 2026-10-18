const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const KINDS = new Set(["skill", "prompt-template", "automation", "plugin"]);
const ROUTE = /^\/(?:skills|prompts|library)\/[A-Za-z0-9][A-Za-z0-9._-]*\/$/;

export function assetPath(kind, slug) {
  return `/${kind === "prompt-template" ? "prompts" : "skills"}/${slug}/`;
}

/** Validate a permanent retirement ledger before it controls routes or sync. */
export function parseAssetConsolidations(value) {
  if (!value || value.schemaVersion !== 1 || !Array.isArray(value.entries)) {
    throw new Error("invalid asset consolidation registry");
  }
  const seen = new Set();
  for (const entry of value.entries) {
    if (!entry || typeof entry.slug !== "string" || typeof entry.replacementSlug !== "string" ||
        !SLUG.test(entry.slug) || !SLUG.test(entry.replacementSlug) ||
        entry.slug === entry.replacementSlug || !KINDS.has(entry.kind) ||
        !KINDS.has(entry.replacementKind) || seen.has(entry.slug)) {
      throw new Error(`invalid or duplicate asset consolidation: ${entry?.slug}`);
    }
    seen.add(entry.slug);
    if (typeof entry.name !== "string" || !entry.name.trim() || typeof entry.reason !== "string" || !entry.reason.trim() ||
        !Array.isArray(entry.legacyPaths) || entry.legacyPaths.some((path) => typeof path !== "string" || !ROUTE.test(path)) ||
        !Array.isArray(entry.legacyDownloads) || entry.legacyDownloads.length === 0) {
      throw new Error(`incomplete asset consolidation: ${entry.slug}`);
    }
    for (const download of entry.legacyDownloads) {
      if (!download || typeof download.path !== "string" || !new RegExp(`^(?:bundles/${entry.slug}\\.(?:zip|json|prompt\\.md)|skills/${entry.slug}\\.md)$`).test(download.path) ||
          !SHA256.test(download.sha256)) {
        throw new Error(`unsafe or unhashed legacy download: ${entry.slug}`);
      }
    }
    if (!entry.source || !/^[a-f0-9]{40}$/.test(entry.source.commit) ||
        entry.source.path !== `submissions/${entry.slug}` || typeof entry.source.author !== "string" || !entry.source.author.trim()) {
      throw new Error(`missing consolidation source provenance: ${entry.slug}`);
    }
  }
  for (const entry of value.entries) {
    if (seen.has(entry.replacementSlug)) {
      throw new Error(`consolidation target is retired; chains are not allowed: ${entry.slug}`);
    }
  }
  consolidationRedirects(value.entries);
  return value.entries;
}

/** Static redirects retain both canonical old paths and older imported aliases. */
export function consolidationRedirects(entries) {
  const routes = new Map();
  for (const entry of entries) {
    const target = assetPath(entry.replacementKind, entry.replacementSlug);
    for (const from of [assetPath(entry.kind, entry.slug), ...entry.legacyPaths]) {
      if (from === target || (routes.has(from) && routes.get(from) !== target)) {
        throw new Error(`conflicting asset consolidation route: ${from}`);
      }
      routes.set(from, target);
    }
  }
  return routes;
}

/** One active record per capability, with old names still available in search. */
export function applyAssetConsolidations(assets, entries) {
  const retired = new Map(entries.map((entry) => [entry.slug, entry]));
  const active = assets.filter((asset) => !retired.has(asset.slug));
  const bySlug = new Map(active.map((asset) => [asset.slug, asset]));
  for (const entry of entries) {
    const target = bySlug.get(entry.replacementSlug);
    if (!target || target.kind !== entry.replacementKind || target.publicationStatus !== "published") {
      throw new Error(`consolidation target must be a published ${entry.replacementKind}: ${entry.replacementSlug}`);
    }
  }
  const unique = (values) => [...new Set(values)];
  const idFor = (kind, slug) => `${kind === "prompt-template" ? "prompt" : kind}:${slug}`;
  const resolveId = (id) => {
    if (!id) return id;
    const separator = id.indexOf(":");
    const slug = separator < 0 ? id : id.slice(separator + 1);
    const entry = retired.get(slug);
    if (!entry || (separator >= 0 && id !== idFor(entry.kind, slug))) return id;
    return separator < 0 ? entry.replacementSlug : idFor(entry.replacementKind, entry.replacementSlug);
  };
  return active.map((asset) => {
    const aliases = entries.filter((entry) => entry.replacementSlug === asset.slug);
    const isSelf = (id) => id === asset.slug || id === idFor(asset.kind, asset.slug);
    return {
      ...asset,
      keywords: unique([...(asset.keywords ?? []), ...aliases.flatMap((entry) => [entry.name, entry.slug])]),
      searchTerms: unique([...(asset.searchTerms ?? []), ...aliases.flatMap((entry) => [entry.name, entry.slug])]),
      legacyPaths: unique([...(asset.legacyPaths ?? []), ...aliases.flatMap((entry) => [assetPath(entry.kind, entry.slug), ...entry.legacyPaths])]),
      relatedAssetIds: unique((asset.relatedAssetIds ?? [])
        .map(resolveId).filter((id) => !isSelf(id))),
      series: (asset.series ?? []).map((step) => {
        const previousAssetId = resolveId(step.previousAssetId);
        const nextAssetId = resolveId(step.nextAssetId);
        return { ...step, previousAssetId: isSelf(previousAssetId) ? null : previousAssetId, nextAssetId: isSelf(nextAssetId) ? null : nextAssetId };
      }),
    };
  });
}
