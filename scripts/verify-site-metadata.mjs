import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { fromHtml } from "hast-util-from-html";
import sharp from "sharp";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(scriptDirectory, "..");
const dist = join(root, "dist");
const siteOrigin = new URL("https://ai.tedt.org/");
const errors = [];
const imageChecks = new Map();

function check(condition, message) {
  if (!condition) errors.push(message);
}

function walk(directory, predicate) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(path, predicate));
    else if (entry.isFile() && predicate(path)) found.push(path);
  }
  return found.sort((a, b) => a.localeCompare(b));
}

function visit(node, callback) {
  callback(node);
  for (const child of node.children ?? []) visit(child, callback);
}

function elements(tree, tagName) {
  const matches = [];
  visit(tree, (node) => {
    if (node.type === "element" && node.tagName === tagName) matches.push(node);
  });
  return matches;
}

function property(node, name) {
  const value = node.properties?.[name];
  return Array.isArray(value) ? value.join(" ") : String(value ?? "");
}

function textContent(node) {
  let value = "";
  visit(node, (child) => {
    if (child.type === "text") value += child.value;
  });
  return value;
}

function one(values, label, page) {
  check(values.length === 1, `${page}: expected one ${label}; found ${values.length}`);
  return values[0];
}

function metaBy(nodes, attribute, value) {
  return nodes.filter((node) => property(node, attribute) === value);
}

function linksByRel(nodes, value) {
  return nodes.filter((node) => property(node, "rel").split(/\s+/).includes(value));
}

function expectedUrlForPage(page) {
  const routePath =
    page === "index.html"
      ? "/"
      : page.endsWith("/index.html")
        ? `/${page.slice(0, -"index.html".length)}`
        : `/${page}`;
  const url = new URL(siteOrigin);
  url.pathname = routePath;
  return url.href;
}

function localAssetPath(href, label, page) {
  let url;
  try {
    url = new URL(href, siteOrigin);
  } catch {
    errors.push(`${page}: ${label} has an invalid URL: ${href}`);
    return undefined;
  }
  check(url.protocol === "https:", `${page}: ${label} must use HTTPS: ${href}`);
  check(url.host === siteOrigin.host, `${page}: ${label} must use ${siteOrigin.host}: ${href}`);
  check(!url.search && !url.hash, `${page}: ${label} URL must not contain a query or fragment: ${href}`);

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  } catch {
    errors.push(`${page}: ${label} has malformed URL encoding: ${href}`);
    return undefined;
  }
  const file = resolve(dist, decodedPath);
  check(
    file === dist || file.startsWith(`${dist}${sep}`),
    `${page}: ${label} escapes dist: ${href}`,
  );
  check(existsSync(file), `${page}: ${label} is missing from dist: ${href}`);
  return existsSync(file) ? file : undefined;
}

async function verifyLinkedAsset(link, label, page, verifyDimensions = false) {
  const href = property(link, "href");
  check(Boolean(href), `${page}: ${label} href is empty`);
  if (!href) return;

  const file = localAssetPath(href, label, page);
  const sizes = property(link, "sizes");
  if (!file || !verifyDimensions || !sizes || sizes === "any") return;

  const [width, height] = sizes.split("x").map(Number);
  check(
    Number.isInteger(width) && Number.isInteger(height),
    `${page}: ${label} has invalid sizes=${sizes}`,
  );
  if (Number.isInteger(width) && Number.isInteger(height)) {
    const metadata = await sharp(file).metadata();
    check(
      metadata.width === width && metadata.height === height,
      `${page}: ${label} dimensions do not match sizes=${sizes}`,
    );
  }
}

function collectReferenceIds(value, references = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectReferenceIds(item, references);
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 1 && typeof value["@id"] === "string") {
      references.push(value["@id"]);
    }
    for (const child of Object.values(value)) collectReferenceIds(child, references);
  }
  return references;
}

async function verifySocialImage(href, page) {
  if (!imageChecks.has(href)) {
    imageChecks.set(
      href,
      (async () => {
        let url;
        try {
          url = new URL(href);
        } catch {
          errors.push(`${page}: social image is not an absolute URL: ${href}`);
          return;
        }
        check(url.protocol === "https:", `${page}: social image must use HTTPS: ${href}`);
        check(url.host === "ai.tedt.org", `${page}: social image must use ai.tedt.org: ${href}`);
        check(!url.search && !url.hash, `${page}: social image URL must be stable: ${href}`);

        const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
        const file = resolve(dist, decodedPath);
        check(
          file === dist || file.startsWith(`${dist}${sep}`),
          `${page}: social image escapes dist: ${href}`,
        );
        if (!existsSync(file)) {
          errors.push(`${page}: social image is missing from dist: ${href}`);
          return;
        }

        const metadata = await sharp(file).metadata();
        check(metadata.format === "jpeg", `${href}: expected JPEG; found ${metadata.format}`);
        check(metadata.width === 1200, `${href}: expected width 1200; found ${metadata.width}`);
        check(metadata.height === 630, `${href}: expected height 630; found ${metadata.height}`);
        check(statSync(file).size < 1024 * 1024, `${href}: image is 1 MiB or larger`);
      })(),
    );
  }
  await imageChecks.get(href);
}

check(existsSync(dist), "dist does not exist; run astro build first");
if (!existsSync(dist)) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const htmlFiles = walk(dist, (path) => path.endsWith(".html"));
const canonicalUrls = new Set();

for (const file of htmlFiles) {
  const page = relative(dist, file).split(sep).join("/");
  const tree = fromHtml(readFileSync(file, "utf8"));
  const metas = elements(tree, "meta");
  const links = elements(tree, "link");
  const scripts = elements(tree, "script");
  const titles = elements(tree, "title");

  const title = one(titles, "title", page);
  check(Boolean(title && textContent(title).trim()), `${page}: title is empty`);

  const description = one(metaBy(metas, "name", "description"), "meta description", page);
  const descriptionText = description ? property(description, "content") : "";
  check(Boolean(descriptionText), `${page}: meta description is empty`);
  check(descriptionText.length <= 200, `${page}: meta description exceeds 200 characters`);

  const robotsMeta = one(metaBy(metas, "name", "robots"), "robots meta", page);
  const robots = robotsMeta ? property(robotsMeta, "content") : "";
  const noindex = /(?:^|,\s*)noindex(?:,|$)/.test(robots);
  check(robots.includes("max-image-preview:large"), `${page}: large image previews are not enabled`);

  const canonicalLinks = linksByRel(links, "canonical");
  let canonicalHref;
  if (noindex) {
    check(canonicalLinks.length === 0, `${page}: noindex page must not declare a canonical URL`);
  } else {
    const canonical = one(canonicalLinks, "canonical link", page);
    if (canonical) {
      const href = property(canonical, "href");
      canonicalHref = href;
      let url;
      try {
        url = new URL(href);
      } catch {
        errors.push(`${page}: canonical is not absolute: ${href}`);
      }
      if (url) {
        check(url.protocol === "https:", `${page}: canonical must use HTTPS`);
        check(url.host === "ai.tedt.org", `${page}: canonical must use ai.tedt.org`);
        check(!url.search && !url.hash, `${page}: canonical must not contain query or fragment`);
        check(
          url.pathname === "/" || url.pathname.endsWith("/"),
          `${page}: canonical must use the trailing-slash policy: ${href}`,
        );
        check(
          href === expectedUrlForPage(page),
          `${page}: canonical does not match its generated route: ${href}`,
        );
        check(!canonicalUrls.has(href), `${page}: duplicate canonical URL ${href}`);
        canonicalUrls.add(href);
      }
    }
  }

  const requiredOpenGraph = [
    "og:title",
    "og:description",
    "og:type",
    "og:url",
    "og:site_name",
    "og:locale",
    "og:image",
    "og:image:secure_url",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
  ];
  const openGraph = Object.fromEntries(
    requiredOpenGraph.map((name) => {
      const node = one(metaBy(metas, "property", name), name, page);
      return [name, node ? property(node, "content") : ""];
    }),
  );
  check(openGraph["og:image:type"] === "image/jpeg", `${page}: og:image:type must be image/jpeg`);
  check(openGraph["og:image:secure_url"] === openGraph["og:image"], `${page}: secure OG image differs`);
  check(openGraph["og:image:width"] === "1200", `${page}: og:image:width must be 1200`);
  check(openGraph["og:image:height"] === "630", `${page}: og:image:height must be 630`);
  check(Boolean(openGraph["og:image:alt"]), `${page}: og:image:alt is empty`);
  if (!noindex && canonicalLinks[0]) {
    check(
      openGraph["og:url"] === property(canonicalLinks[0], "href"),
      `${page}: og:url does not match canonical`,
    );
  }

  const requiredTwitter = [
    "twitter:card",
    "twitter:site",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
  ];
  const twitter = Object.fromEntries(
    requiredTwitter.map((name) => {
      const node = one(metaBy(metas, "name", name), name, page);
      return [name, node ? property(node, "content") : ""];
    }),
  );
  check(twitter["twitter:card"] === "summary_large_image", `${page}: wrong Twitter card type`);
  check(twitter["twitter:image"] === openGraph["og:image"], `${page}: Twitter and OG images differ`);
  check(twitter["twitter:image:alt"] === openGraph["og:image:alt"], `${page}: social image alt text differs`);

  const manifestLink = one(linksByRel(links, "manifest"), "manifest link", page);
  const appleIcon = one(linksByRel(links, "apple-touch-icon"), "Apple touch icon", page);
  const iconLinks = linksByRel(links, "icon");
  check(iconLinks.length >= 3, `${page}: expected ICO and PNG icon links`);
  if (manifestLink) await verifyLinkedAsset(manifestLink, "manifest", page);
  if (appleIcon) await verifyLinkedAsset(appleIcon, "Apple touch icon", page, true);
  for (const [index, icon] of iconLinks.entries()) {
    await verifyLinkedAsset(icon, `icon ${index + 1}`, page, true);
  }

  const jsonLdScripts = scripts.filter(
    (script) => property(script, "type") === "application/ld+json",
  );
  if (noindex) {
    check(jsonLdScripts.length === 0, `${page}: noindex page must not emit JSON-LD`);
  } else {
    const jsonLdScript = one(jsonLdScripts, "JSON-LD block", page);
    if (jsonLdScript) {
      try {
        const json = JSON.parse(textContent(jsonLdScript));
        check(json["@context"] === "https://schema.org", `${page}: wrong JSON-LD context`);
        check(Array.isArray(json["@graph"]), `${page}: JSON-LD @graph is missing`);
        if (Array.isArray(json["@graph"]) && canonicalHref) {
          const graph = json["@graph"];
          const definedIds = graph
            .map((node) => node?.["@id"])
            .filter((id) => typeof id === "string");
          check(
            definedIds.length === new Set(definedIds).size,
            `${page}: JSON-LD contains duplicate @id values`,
          );

          const pageId = `${canonicalHref}#webpage`;
          const imageId = `${openGraph["og:image"]}#primaryimage`;
          const pageNode = graph.find((node) => node?.["@id"] === pageId);
          const imageNode = graph.find((node) => node?.["@id"] === imageId);
          const websiteNode = graph.find(
            (node) => node?.["@id"] === `${siteOrigin.href}#website`,
          );
          check(Boolean(pageNode), `${page}: JSON-LD page node does not match canonical`);
          check(Boolean(imageNode), `${page}: JSON-LD image node does not match og:image`);
          check(Boolean(websiteNode), `${page}: JSON-LD WebSite node is missing`);
          if (pageNode) {
            check(pageNode.url === canonicalHref, `${page}: JSON-LD page URL differs from canonical`);
            check(
              pageNode.primaryImageOfPage?.["@id"] === imageId &&
                pageNode.image?.["@id"] === imageId,
              `${page}: JSON-LD primary image references do not match og:image`,
            );
            check(pageNode.name === textContent(title).trim(), `${page}: JSON-LD page name differs from title`);
            check(pageNode.description === descriptionText, `${page}: JSON-LD description differs from meta description`);
          }
          if (imageNode) {
            check(
              imageNode.url === openGraph["og:image"] &&
                imageNode.contentUrl === openGraph["og:image"],
              `${page}: JSON-LD image URLs differ from og:image`,
            );
          }

          const knownIds = new Set(definedIds);
          for (const id of collectReferenceIds(graph)) {
            if (id.startsWith(siteOrigin.href) && id.includes("#")) {
              check(knownIds.has(id), `${page}: JSON-LD contains unresolved @id reference ${id}`);
            }
          }
        }
      } catch (error) {
        errors.push(`${page}: invalid JSON-LD: ${error.message}`);
      }
    }
  }

  await verifySocialImage(openGraph["og:image"], page);
}

await Promise.all(imageChecks.values());

const robotsPath = join(dist, "robots.txt");
check(existsSync(robotsPath), "robots.txt is missing");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  check(robots.includes("User-agent: *\nAllow: /"), "robots.txt does not allow public crawling");
  check(
    robots.includes("Sitemap: https://ai.tedt.org/sitemap.xml"),
    "robots.txt does not advertise the canonical sitemap",
  );
}

const sitemapPath = join(dist, "sitemap.xml");
check(existsSync(sitemapPath), "sitemap.xml is missing");
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapUrls = new Set(locations);
  check(locations.length === sitemapUrls.size, "sitemap.xml contains duplicate URLs");
  for (const canonical of canonicalUrls) {
    check(sitemapUrls.has(canonical), `sitemap.xml is missing ${canonical}`);
  }
  for (const location of sitemapUrls) {
    check(canonicalUrls.has(location), `sitemap.xml includes non-canonical URL ${location}`);
  }
}

const manifestPath = join(dist, "site.webmanifest");
check(existsSync(manifestPath), "site.webmanifest is missing");
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    check(manifest.name && manifest.short_name, "manifest name fields are missing");
    check(manifest.id === "/" && manifest.start_url === "/", "manifest identity URLs are wrong");
    check(Array.isArray(manifest.icons) && manifest.icons.length >= 3, "manifest icons are incomplete");
    for (const icon of manifest.icons ?? []) {
      const file = join(dist, String(icon.src).replace(/^\/+/, ""));
      check(existsSync(file), `manifest icon is missing: ${icon.src}`);
      if (existsSync(file)) {
        const metadata = await sharp(file).metadata();
        const [width, height] = String(icon.sizes).split("x").map(Number);
        check(metadata.width === width && metadata.height === height, `${icon.src}: dimensions do not match manifest`);
      }
    }
    check(
      manifest.icons?.some((icon) => String(icon.purpose).split(/\s+/).includes("maskable")),
      "manifest has no maskable icon",
    );
  } catch (error) {
    errors.push(`invalid site.webmanifest: ${error.message}`);
  }
}

for (const required of ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
  check(existsSync(join(dist, required)), `${required} is missing`);
}

if (errors.length > 0) {
  console.error(`Metadata audit failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- …and ${errors.length - 100} more`);
  process.exit(1);
}

console.log(
  `Metadata audit passed: ${htmlFiles.length} HTML pages, ${canonicalUrls.size} canonical URLs, and ${imageChecks.size} social images.`,
);
