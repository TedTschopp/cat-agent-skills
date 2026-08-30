import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import satori from "satori";
import { compactDescription } from "./site-metadata";

const require = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = "#f8f6f0";
const INK = "#07090f";
const SLATE = "#101820";
const NAVY = "#00446f";
const CYAN = "#00a9e0";
const ORANGE = "#e86027";
const MUTED = "#4f5052";
const LIGHT_MUTED = "#c8c7c3";

function fontFile(pkg: string, file: string): Buffer {
  return readFileSync(require.resolve(`${pkg}/files/${file}`));
}

let fontsCache: Parameters<typeof satori>[1]["fonts"] | null = null;
function fonts() {
  if (fontsCache) return fontsCache;
  fontsCache = [
    {
      name: "DM Sans",
      data: fontFile("@fontsource/dm-sans", "dm-sans-latin-400-normal.woff"),
      weight: 400,
      style: "normal",
    },
    {
      name: "DM Sans",
      data: fontFile("@fontsource/dm-sans", "dm-sans-latin-700-normal.woff"),
      weight: 700,
      style: "normal",
    },
    {
      name: "JetBrains Mono",
      data: fontFile(
        "@fontsource/jetbrains-mono",
        "jetbrains-mono-latin-500-normal.woff",
      ),
      weight: 500,
      style: "normal",
    },
  ];
  return fontsCache;
}

type El = {
  type: string;
  props: { style: Record<string, unknown>; children?: unknown; [key: string]: unknown };
};

const box = (style: Record<string, unknown>, children?: unknown): El => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

const text = (style: Record<string, unknown>, value: string): El => ({
  type: "div",
  props: { style, children: value },
});

const imageCache = new Map<string, Promise<string>>();

function imageDataUri(path: string): Promise<string> {
  const cached = imageCache.get(path);
  if (cached) return cached;

  const pending = sharp(join(process.cwd(), "public", path.replace(/^\/+/, "")))
    .resize(800, 500, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer()
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);
  imageCache.set(path, pending);
  return pending;
}

export interface SocialCardInput {
  title: string;
  description: string;
  label?: string;
  kind?: string;
  byline?: string;
  badges?: string[];
  artPath?: string;
  artFit?: "cover" | "contain";
  initials?: string;
  coverField?: string;
  accent?: string;
}

function titleSize(title: string): number {
  if (title.length > 72) return 42;
  if (title.length > 54) return 48;
  if (title.length > 38) return 54;
  return 62;
}

async function artElement(input: SocialCardInput): Promise<El> {
  const accent = input.accent ?? CYAN;
  const frameStyle = {
    width: 400,
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(248,246,240,0.18)",
    background: SLATE,
    alignItems: "center",
    justifyContent: "center",
  };

  if (input.artPath) {
    return box(frameStyle, [
      {
        type: "img",
        props: {
          src: await imageDataUri(input.artPath),
          width: 400,
          height: 250,
          style: {
            width: 400,
            height: 250,
            objectFit: input.artFit ?? "cover",
          },
        },
      } as unknown as El,
      box({
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: accent,
      }),
    ]);
  }

  return box(
    {
      ...frameStyle,
      backgroundImage:
        input.coverField ??
        "radial-gradient(120% 140% at 48% 8%, rgba(0,169,224,.42) 0%, rgba(0,169,224,.1) 34%, transparent 62%), linear-gradient(180deg,#17202b 0%,#101820 55%,#07090f 100%)",
    },
    [
      text(
        {
          fontSize: 82,
          fontWeight: 700,
          color: PAPER,
          letterSpacing: -2,
          textShadow: `0 0 24px ${accent}`,
        },
        input.initials ?? "AI",
      ),
      box({
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: accent,
      }),
    ],
  );
}

async function cardElement(input: SocialCardInput): Promise<El> {
  const description = compactDescription(input.description, 155);
  const badges = (input.badges ?? []).slice(0, 3).map((badge) =>
    box(
      {
        border: "1px solid #b0afac",
        borderRadius: 999,
        padding: "7px 13px",
        background: "#fffdf8",
      },
      text(
        {
          fontFamily: "JetBrains Mono",
          fontSize: 14,
          fontWeight: 500,
          color: NAVY,
          letterSpacing: 0.5,
        },
        badge,
      ),
    ),
  );

  return box(
    {
      width: WIDTH,
      height: HEIGHT,
      position: "relative",
      flexDirection: "column",
      background: PAPER,
      color: INK,
      fontFamily: "DM Sans",
    },
    [
      box(
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: 720,
          height: 5,
        },
        [
          box({ width: 315, height: 5, background: CYAN }),
          box({ width: 245, height: 5, background: NAVY }),
          box({ width: 160, height: 5, background: ORANGE }),
        ],
      ),
      box(
        {
          width: WIDTH,
          height: HEIGHT,
          boxSizing: "border-box",
        },
        [
          box(
            {
              width: 720,
              height: HEIGHT,
              boxSizing: "border-box",
              flexDirection: "column",
              flexShrink: 0,
              padding: "52px 58px 38px 62px",
            },
            [
              text(
                {
                  fontFamily: "JetBrains Mono",
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: 2.2,
                  textTransform: "uppercase",
                  color: "#006f94",
                  flexShrink: 0,
                },
                input.label ?? "AI.Tedt.org",
              ),
              text(
                {
                  marginTop: 16,
                  maxWidth: 590,
                  maxHeight: 215,
                  overflow: "hidden",
                  fontSize: titleSize(input.title),
                  fontWeight: 700,
                  lineHeight: 1.04,
                  letterSpacing: -1.5,
                  color: NAVY,
                  flexShrink: 0,
                },
                input.title,
              ),
              text(
                {
                  marginTop: 20,
                  maxWidth: 590,
                  maxHeight: 150,
                  overflow: "hidden",
                  fontSize: 25,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: MUTED,
                  flexShrink: 0,
                },
                description,
              ),
              box(
                {
                  marginTop: "auto",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                  flexShrink: 0,
                },
                badges,
              ),
            ],
          ),
          box(
            {
              width: 480,
              height: HEIGHT,
              boxSizing: "border-box",
              flexDirection: "column",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              padding: "44px 40px 36px",
              background: SLATE,
            },
            [
              await artElement(input),
              text(
                {
                  marginTop: 28,
                  fontFamily: "JetBrains Mono",
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: input.accent ?? CYAN,
                  textAlign: "center",
                },
                input.kind ?? "Prompts and Agent Skills",
              ),
              input.byline
                ? text(
                    {
                      marginTop: 10,
                      maxWidth: 390,
                      fontSize: 20,
                      lineHeight: 1.25,
                      color: LIGHT_MUTED,
                      textAlign: "center",
                    },
                    input.byline,
                  )
                : null,
            ],
          ),
        ],
      ),
      box(
        {
          position: "absolute",
          left: 62,
          bottom: 18,
          alignItems: "center",
          gap: 12,
        },
        [
          text(
            {
              fontSize: 20,
              fontWeight: 700,
              color: NAVY,
            },
            "AI.Tedt.org",
          ),
          text(
            {
              fontFamily: "JetBrains Mono",
              fontSize: 15,
              fontWeight: 500,
              color: "#676869",
            },
            "PROMPTS AND AGENT SKILLS",
          ),
        ],
      ),
    ],
  );
}

/** Render a crawler-safe 1200×630 JPEG social preview. */
export async function renderSocialCardJpeg(input: SocialCardInput): Promise<Buffer> {
  const svg = await satori((await cardElement(input)) as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: fonts(),
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

  return sharp(png)
    .jpeg({ quality: 88, progressive: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
