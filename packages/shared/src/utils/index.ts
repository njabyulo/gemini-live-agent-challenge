export const decodeBase64ToBytes = (data: string): Uint8Array => {
  const buffer = Buffer.from(data, "base64");
  return new Uint8Array(buffer);
};

export const encodeBytesToBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

export const toPrettyTitle = (value: string): string =>
  value
    .split(/[-_]/u)
    .filter(Boolean)
    .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
    .join(" ");
