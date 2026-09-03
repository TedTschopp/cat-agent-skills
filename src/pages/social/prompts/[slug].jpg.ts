import type { APIRoute, GetStaticPaths } from "astro";
import { getLibraryAssets, type LibraryAsset } from "../../../lib/library-assets";
import { coverAccent, coverField, initials } from "../../../lib/skills";
import { renderSocialCardJpeg } from "../../../lib/social-card";
import { worksWithLabel } from "../../../components/asset-labels";

export const getStaticPaths: GetStaticPaths = async () =>
  (await getLibraryAssets())
    .filter((asset) => asset.kind === "prompt-template")
    .map((asset) => ({ params: { slug: asset.slug }, props: { asset } }));

export const GET: APIRoute = async ({ props }) => {
  const asset = props.asset as LibraryAsset;
  const accent = coverAccent(asset.slug);
  const image = await renderSocialCardJpeg({
    label: "AI Library",
    title: asset.name,
    description: asset.description,
    badges: asset.worksWith.map(worksWithLabel),
    kind: asset.kindLabel,
    byline: `By ${asset.author.name}`,
    artPath: asset.artwork.image ?? undefined,
    initials: initials(asset.name),
    coverField: coverField(asset.slug),
    accent,
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
