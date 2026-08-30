import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = resolve(root, "public", "logo-site.webp");

async function squarePng(size) {
  return sharp(source).resize(size, size, { fit: "cover" }).png().toBuffer();
}

function makeIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = entrySize * images.length;
  let imageOffset = headerSize + directorySize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(imageOffset, 12);
    imageOffset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

const faviconImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await squarePng(size) })),
);
await writeFile(resolve(root, "public", "favicon.ico"), makeIco(faviconImages));
await writeFile(resolve(root, "public", "apple-touch-icon.png"), await squarePng(180));
await writeFile(resolve(root, "public", "icon-192.png"), await squarePng(192));
await writeFile(resolve(root, "public", "icon-512.png"), await squarePng(512));

const maskableMark = await sharp(source)
  .resize(400, 400, { fit: "contain" })
  .png()
  .toBuffer();
const maskable = await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#101820",
  },
})
  .composite([{ input: maskableMark, left: 56, top: 56 }])
  .png()
  .toBuffer();
await writeFile(resolve(root, "public", "icon-maskable-512.png"), maskable);

console.log("Generated favicon.ico, Apple touch icon, and manifest icons.");
