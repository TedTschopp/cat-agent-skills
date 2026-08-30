/**
 * Fail closed when generated gallery Markdown would render active content.
 *
 * The check renders Markdown with the same parser family Astro uses, then
 * parses the resulting HTML into HAST. That keeps examples inside inline and
 * fenced code inert while exposing raw HTML and Markdown links/images for
 * structural inspection.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fromHtml } from "hast-util-from-html";
import { markdownToHtml } from "satteri";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOCKED_ELEMENTS = new Set([
  "applet",
  "base",
  "embed",
  "frame",
  "frameset",
  "iframe",
  "link",
  "math",
  "meta",
  "object",
  "script",
  "style",
  "svg",
]);
const URL_PROPERTIES = new Set([
  "action",
  "archive",
  "background",
  "cite",
  "codebase",
  "data",
  "formaction",
  "href",
  "longdesc",
  "manifest",
  "poster",
  "profile",
  "src",
  "usemap",
  "xlinkhref",
]);

function assertSafeSlug(slug) {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(`unsafe generated slug: ${slug}`);
  }
}

function propertyStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return [];
}

/** Match protocols after the whitespace/control normalization browsers apply. */
function dangerousProtocol(value) {
  const normalized = value
    .trimStart()
    .replace(/[\u0000-\u0020\u007f]+/g, "")
    .toLowerCase();
  const match = /^(javascript|vbscript|data):/.exec(normalized);
  return match?.[1];
}

function dangerousSrcSetProtocol(value) {
  // A source candidate starts at the attribute boundary or after a comma. A
  // data URL's own comma comes later, after the dangerous scheme is detected.
  for (const candidate of value.split(/,(?=\s*[^\s])/)) {
    const protocol = dangerousProtocol(candidate);
    if (protocol) return protocol;
  }
  return undefined;
}

function dangerousStyleProtocol(value) {
  const withoutComments = value.replace(/\/\*[\s\S]*?\*\//g, "");
  const urls = withoutComments.matchAll(/url\s*\(\s*(["']?)([\s\S]*?)\1\s*\)/gi);
  for (const match of urls) {
    const protocol = dangerousProtocol(match[2]);
    if (protocol) return protocol;
  }
  return undefined;
}

function inspectTree(node, file, issues) {
  if (!node || typeof node !== "object") return;

  if (node.type === "element") {
    const tagName = String(node.tagName).toLowerCase();
    if (BLOCKED_ELEMENTS.has(tagName)) {
      issues.push(`${file}: blocked active <${tagName}> element`);
    }

    for (const [propertyName, propertyValue] of Object.entries(node.properties ?? {})) {
      const normalizedName = propertyName.toLowerCase();
      if (/^on[a-z]/.test(normalizedName)) {
        issues.push(
          `${file}: blocked event-handler attribute "${propertyName}" on <${tagName}>`,
        );
      }
      if (normalizedName === "srcdoc") {
        issues.push(`${file}: blocked "srcdoc" attribute on <${tagName}>`);
      }

      for (const value of propertyStrings(propertyValue)) {
        let protocol;
        if (URL_PROPERTIES.has(normalizedName) || normalizedName === "ping") {
          protocol = dangerousProtocol(value);
        } else if (normalizedName === "srcset") {
          protocol = dangerousSrcSetProtocol(value);
        } else if (normalizedName === "style") {
          protocol = dangerousStyleProtocol(value);
        }
        if (protocol) {
          issues.push(
            `${file}: blocked ${protocol}: URL in "${propertyName}" on <${tagName}>`,
          );
        }
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) inspectTree(child, file, issues);
  }
  // HAST stores ordinary and declarative <template> descendants in `content`,
  // not `children`. Declarative shadow DOM makes that content live during the
  // browser's initial parse, so event handlers and blocked elements there must
  // be inspected exactly like light-DOM descendants.
  if (node.content) inspectTree(node.content, file, issues);
}

function inspectMarkdown(repoRoot, path, issues) {
  const absolutePath = join(repoRoot, path);
  const markdown = readFileSync(absolutePath, "utf8");
  let html;
  try {
    ({ html } = markdownToHtml(markdown));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`could not render ${path} for active-content verification: ${message}`);
  }

  // parse5 drops legacy frame elements in a body fragment, but a browser can
  // still interpret them in document parsing contexts. Detect those tags in
  // the rendered HTML before materializing the HAST. Code samples are already
  // escaped to &lt;...&gt; by the Markdown renderer and cannot match here.
  for (const tagName of ["frame", "frameset"]) {
    if (new RegExp(`<\\s*${tagName}\\b`, "i").test(html)) {
      issues.push(`${path}: blocked active <${tagName}> element`);
    }
  }
  inspectTree(fromHtml(html, { fragment: true }), path, issues);
}

/** Verify generated skill pages and any generated guide pages for exact slugs. */
export function verifyRenderedMarkdown({ repoRoot, generatedSlugs }) {
  const root = resolve(repoRoot);
  const files = [];
  const issues = [];

  for (const slug of [...new Set(generatedSlugs)].sort()) {
    assertSafeSlug(slug);
    const skillPath = `src/content/skills/${slug}.md`;
    if (!existsSync(join(root, skillPath))) {
      throw new Error(`missing generated Markdown required for verification: ${skillPath}`);
    }
    files.push(skillPath);

    const guidePath = `src/content/guides/${slug}.md`;
    if (existsSync(join(root, guidePath))) files.push(guidePath);
  }

  for (const path of files) inspectMarkdown(root, path, issues);
  if (issues.length > 0) {
    throw new Error(
      "generated Markdown contains active content that is unsafe to publish:\n" +
        issues.map((issue) => `  - ${issue}`).join("\n"),
    );
  }

  return { files: files.map((path) => relative(root, join(root, path))) };
}

function parseCliArgs(args) {
  const options = { repoRoot: process.cwd(), generatedSlugs: undefined };
  const nextValue = (index, flag) => {
    if (index + 1 >= args.length || !args[index + 1]) {
      throw new Error(`${flag} requires a value`);
    }
    return args[index + 1];
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--repo-root") {
      options.repoRoot = nextValue(index, arg);
      index += 1;
    } else if (arg === "--generated-slugs") {
      options.generatedSlugs = nextValue(index, arg)
        .split(",")
        .filter(Boolean);
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  if (!options.generatedSlugs || options.generatedSlugs.length === 0) {
    throw new Error("--generated-slugs requires at least one slug");
  }
  return options;
}

function main() {
  const options = parseCliArgs(process.argv.slice(2));
  const result = verifyRenderedMarkdown(options);
  console.log(
    `Rendered Markdown safety check passed for ${result.files.length} generated file(s).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n\u2717 ${message}`);
    process.exit(1);
  }
}
