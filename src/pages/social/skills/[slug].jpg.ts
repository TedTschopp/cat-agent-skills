import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { coverAccent, coverField, initials } from "../../../lib/skills";
import { renderSocialCardJpeg } from "../../../lib/social-card";

export const getStaticPaths: GetStaticPaths = async () => {
  const skills = await getCollection("skills");
  return skills.map((skill) => ({
    params: { slug: skill.id },
    props: { skill },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const skill = props.skill;
  const data = skill.data;
  const kind =
    data.type === "plugin"
      ? "Agent plugin"
      : data.type === "automation"
        ? "Agent automation"
        : "Agent skill";
  const accent = data.coverColor ?? coverAccent(skill.id);

  const image = await renderSocialCardJpeg({
    label: "AI.Tedt.org",
    title: data.name,
    description: data.description,
    badges: data.platforms,
    kind,
    byline: `By ${data.author}`,
    artPath: data.coverImage,
    initials: initials(data.name),
    coverField: coverField(skill.id, data.coverColor),
    accent,
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
