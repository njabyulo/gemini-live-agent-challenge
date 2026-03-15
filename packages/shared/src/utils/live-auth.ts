import type { ILiveSessionTokenClaims } from "../types/live";
import { decodeBase64ToBytes, encodeBytesToBase64 } from "./platform";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64ToBase64Url = (value: string) =>
  value.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");

const base64UrlToBase64 = (value: string) => {
  const base64 = value.replace(/-/gu, "+").replace(/_/gu, "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;

  return `${base64}${"=".repeat(paddingLength)}`;
};

const base64UrlEncode = (value: string | Uint8Array) =>
  base64ToBase64Url(
    encodeBytesToBase64(
      typeof value === "string" ? encoder.encode(value) : value,
    ),
  );

const base64UrlDecodeToText = (value: string) =>
  decoder.decode(decodeBase64ToBytes(base64UrlToBase64(value)));

const base64UrlDecodeToBytes = (value: string) =>
  decodeBase64ToBytes(base64UrlToBase64(value));

const importHmacKey = async (secret: string) =>
  await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"],
  );

const isLiveSessionTokenClaims = (
  value: unknown,
): value is ILiveSessionTokenClaims => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.aud === "agent-tutor-live" &&
    candidate.scope === "live:connect" &&
    typeof candidate.sub === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.sid === "string" &&
    typeof candidate.iat === "number" &&
    typeof candidate.exp === "number"
  );
};

export const signLiveSessionToken = async ({
  claims,
  secret,
}: {
  claims: ILiveSessionTokenClaims;
  secret: string;
}) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));
  const unsignedToken = `${encodedHeader}.${encodedClaims}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    await importHmacKey(secret),
    encoder.encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;
};

export const verifyLiveSessionToken = async ({
  expectedAudience = "agent-tutor-live",
  expectedScope = "live:connect",
  secret,
  token,
}: {
  expectedAudience?: ILiveSessionTokenClaims["aud"];
  expectedScope?: ILiveSessionTokenClaims["scope"];
  secret: string;
  token: string;
}) => {
  const [encodedHeader, encodedClaims, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedClaims || !encodedSignature) {
    throw new Error("Invalid live session token format.");
  }

  const unsignedToken = `${encodedHeader}.${encodedClaims}`;
  const signature = Uint8Array.from(base64UrlDecodeToBytes(encodedSignature));
  const isValidSignature = await crypto.subtle.verify(
    "HMAC",
    await importHmacKey(secret),
    signature,
    encoder.encode(unsignedToken),
  );

  if (!isValidSignature) {
    throw new Error("Invalid live session token signature.");
  }

  const rawHeader = JSON.parse(base64UrlDecodeToText(encodedHeader));
  if (rawHeader.alg !== "HS256" || rawHeader.typ !== "JWT") {
    throw new Error("Invalid live session token header.");
  }

  const claims = JSON.parse(base64UrlDecodeToText(encodedClaims)) as unknown;

  if (!isLiveSessionTokenClaims(claims)) {
    throw new Error("Invalid live session token claims.");
  }

  if (claims.aud !== expectedAudience) {
    throw new Error("Invalid live session token audience.");
  }

  if (claims.scope !== expectedScope) {
    throw new Error("Invalid live session token scope.");
  }

  if (claims.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Live session token expired.");
  }

  return claims;
};
