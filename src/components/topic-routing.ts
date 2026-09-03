/**
 * Topic values come from multiple content families. Treat casing differences
 * as one topic so `Writing` and `writing` cannot generate competing routes on
 * case-insensitive filesystems.
 */
export const topicKey = (topic: string): string =>
  topic.trim().toLocaleLowerCase("en-US");

type TopicAsset = {
  topics: readonly string[];
};

export type TopicGroup<T extends TopicAsset> = {
  key: string;
  routeTopic: string;
  label: string;
  assets: T[];
};

const byName = (left: string, right: string): number =>
  left.localeCompare(right, "en-US");

/**
 * Keep an established lowercase route when one exists. This preserves the
 * original skill-gallery URLs while still retaining acronym-only routes such
 * as `/tags/BATNA/`.
 */
function routeVariant(key: string, variants: readonly string[]): string {
  return (
    variants.find((variant) => variant === key) ??
    [...variants].sort(byName)[0] ??
    key
  );
}

/** Prefer a human-authored capitalized spelling for visible labels. */
function labelVariant(routeTopic: string, variants: readonly string[]): string {
  return (
    [...variants]
      .filter((variant) => variant !== topicKey(variant))
      .sort(byName)[0] ?? routeTopic
  );
}

export function groupAssetsByTopic<T extends TopicAsset>(
  assets: readonly T[],
): TopicGroup<T>[] {
  const grouped = new Map<
    string,
    { variants: Set<string>; assets: T[]; seenAssets: Set<T> }
  >();

  for (const asset of assets) {
    for (const topic of asset.topics) {
      const trimmed = topic.trim();
      const key = topicKey(trimmed);
      if (!key) continue;
      const group = grouped.get(key) ?? {
        variants: new Set<string>(),
        assets: [],
        seenAssets: new Set<T>(),
      };
      group.variants.add(trimmed);
      if (!group.seenAssets.has(asset)) {
        group.assets.push(asset);
        group.seenAssets.add(asset);
      }
      grouped.set(key, group);
    }
  }

  return [...grouped.entries()]
    .map(([key, group]) => {
      const variants = [...group.variants];
      const routeTopic = routeVariant(key, variants);
      return {
        key,
        routeTopic,
        label: labelVariant(routeTopic, variants),
        assets: group.assets,
      };
    })
    .sort((left, right) => byName(left.label, right.label));
}
