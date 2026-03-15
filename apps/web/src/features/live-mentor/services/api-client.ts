import {
  getBrowserAgentTutorLiveWebSocketUrl,
  getBrowserApiBaseUrl,
  resolveBrowserAddress,
} from "~/utils/runtime-url";

const API_BASE_URL = resolveBrowserAddress(
  getBrowserApiBaseUrl(),
);

export const getApiBaseUrl = () => API_BASE_URL.replace(/\/$/, "");

export const getAgentTutorLiveWebSocketUrl = () =>
  resolveBrowserAddress(getBrowserAgentTutorLiveWebSocketUrl());

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
