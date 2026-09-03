import type { LibraryAsset, LibraryAssetSummary } from "../lib/library-assets";
import { worksWithLabel } from "./asset-labels";
import { topicKey } from "./topic-routing";

export const assetId = (asset: Pick<LibraryAsset, "kind" | "slug">): string =>
  `${asset.kind === "prompt-template" ? "prompt" : asset.kind}:${asset.slug}`;

/** Resolve declared relationships first, then fill the shelf with close catalog neighbors. */
export function relatedAssetsFor(
  asset: LibraryAsset,
  allAssets: readonly LibraryAsset[],
  limit = 3,
): LibraryAssetSummary[] {
  const byId = new Map(allAssets.map((candidate) => [assetId(candidate), candidate]));
  const selected: LibraryAsset[] = [];
  const seen = new Set<string>([assetId(asset)]);
  const assetCompatibility = new Set(asset.worksWith.map(worksWithLabel));
  const assetTopics = new Set(asset.topics.map(topicKey));
  const assetTags = new Set(asset.tags.map(topicKey));

  for (const id of asset.relatedAssetIds) {
    const candidate = byId.get(id);
    if (!candidate || seen.has(id)) continue;
    selected.push(candidate);
    seen.add(id);
  }

  const scored = allAssets
    .filter((candidate) => !seen.has(assetId(candidate)) && !candidate.tags.includes("sample"))
    .map((candidate) => {
      const sharedTopics = candidate.topics.filter((topic) => assetTopics.has(topicKey(topic))).length;
      const sharedTags = candidate.tags.filter((tag) => assetTags.has(topicKey(tag))).length;
      const sharedCompatibility = candidate.worksWith
        .map(worksWithLabel)
        .filter((item) => assetCompatibility.has(item)).length;
      // Granular contributor tags retain precise relevance after the public
      // Topics vocabulary is compressed into broad catalog facets.
      const score = sharedTags * 6 + sharedTopics * 2 + sharedCompatibility * 2 + (candidate.kind === asset.kind ? 1 : 0);
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort(({ candidate: left, score: leftScore }, { candidate: right, score: rightScore }) =>
      rightScore - leftScore || Number(right.featured) - Number(left.featured) || left.name.localeCompare(right.name),
    );

  for (const { candidate } of scored) {
    if (selected.length >= limit) break;
    const id = assetId(candidate);
    if (seen.has(id)) continue;
    selected.push(candidate);
    seen.add(id);
  }

  return selected
    .slice(0, limit)
    .map(({ content: _content, searchTerms: _searchTerms, ...summary }) => summary);
}

export function isSkillFamily(asset: Pick<LibraryAsset, "kind">): boolean {
  return asset.kind === "skill" || asset.kind === "plugin" || asset.kind === "automation";
}
