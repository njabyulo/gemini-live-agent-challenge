import { resolveBrowserAddress } from "~/utils/runtime-url";

const API_BASE_URL = resolveBrowserAddress(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787",
);

export const getApiBaseUrl = () => API_BASE_URL.replace(/\/$/, "");

export const getAgentLiveWebSocketUrl = () =>
  resolveBrowserAddress(
    process.env.NEXT_PUBLIC_AGENT_LIVE_WS_URL ?? "ws://localhost:8080/live",
  );

export async function fetchJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
