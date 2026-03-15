import {
  getBrowserAgentTutorLiveWebSocketUrl,
  getBrowserApiBaseUrl,
  resolveBrowserAddress,
} from "~/utils/runtime-url";
import type { ILiveSessionTokenResponse } from "@gemini-live-agent/shared/types";

const API_BASE_URL = resolveBrowserAddress(
  getBrowserApiBaseUrl(),
);

export const getApiBaseUrl = () => API_BASE_URL.replace(/\/$/, "");

export const getAgentTutorLiveWebSocketUrl = () =>
  resolveBrowserAddress(getBrowserAgentTutorLiveWebSocketUrl());

export const getAgentTutorLiveAuthorizedWebSocketUrl = (token: string) => {
  const url = new URL(getAgentTutorLiveWebSocketUrl());
  url.searchParams.set("token", token);
  return url.toString();
};

export const createAgentTutorLiveSessionToken = async () =>
  await fetchJson<ILiveSessionTokenResponse>("/api/live/token", {
    method: "POST",
  });

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
