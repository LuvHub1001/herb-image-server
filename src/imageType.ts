export type ImageType = { mime: string; extension: string };

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length &&
  bytes.every((b, i) => buf[offset + i] === b);

export function detectImageType(buf: Buffer): ImageType | null {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: ".jpg" };
  }
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", extension: ".png" };
  }
  if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) {
    return { mime: "image/gif", extension: ".gif" };
  }
  // RIFF....WEBP
  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { mime: "image/webp", extension: ".webp" };
  }
  return null;
}
