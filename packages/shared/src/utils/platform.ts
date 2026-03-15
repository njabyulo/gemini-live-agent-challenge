const bytesToBinary = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

export const decodeBase64ToBytes = (data: string): Uint8Array => {
  const binary = atob(data);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const encodeBytesToBase64 = (bytes: Uint8Array): string =>
  btoa(bytesToBinary(bytes));

export const toPrettyTitle = (value: string): string =>
  value
    .split(/[-_]/u)
    .filter(Boolean)
    .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
    .join(" ");
