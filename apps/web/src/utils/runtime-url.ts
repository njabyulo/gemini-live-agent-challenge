"use client";

const PRODUCTION_APP_HOSTNAMES = new Set([
  "gemini-live-agent.njabulomajozi.com",
]);

const DEFAULT_PRODUCTION_AGENT_TUTOR_LIVE_WS_URL =
  "wss://gemini-live-agent-prod-run-agent-backend-00-lplavjqpvq-uc.a.run.app/live";

const getBrowserHttpOrigin = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.origin;
};

const getLocalBrowserOrigin = (port: number, protocol?: "http:" | "ws:") => {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname } = window.location;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return null;
  }

  const scheme = protocol ?? window.location.protocol;
  return `${scheme}//${hostname}:${port}`;
};

const getBrowserWebSocketOrigin = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};

const getLocalOriginAlias = (value: string, browserHostname: string) => {
  try {
    const url = new URL(value);

    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      browserHostname &&
      browserHostname !== url.hostname
    ) {
      url.hostname = browserHostname;
      return url.toString();
    }
  } catch {
    return value;
  }

  return value;
};

export const resolveBrowserAddress = (value: string) => {
  if (typeof window === "undefined") {
    return value;
  }

  return getLocalOriginAlias(value, window.location.hostname);
};

export const getBrowserApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:8787";
  }

  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    getLocalBrowserOrigin(8787, "http:") ??
    getBrowserHttpOrigin() ??
    ""
  );
};

export const getBrowserAgentTutorLiveWebSocketUrl = () => {
  if (typeof window === "undefined") {
    return "ws://localhost:8080/live";
  }

  if (PRODUCTION_APP_HOSTNAMES.has(window.location.hostname)) {
    return (
      process.env.NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL ??
      DEFAULT_PRODUCTION_AGENT_TUTOR_LIVE_WS_URL
    );
  }

  return (
    process.env.NEXT_PUBLIC_AGENT_TUTOR_LIVE_WS_URL ??
    `${getLocalBrowserOrigin(8080, "ws:") ?? getBrowserWebSocketOrigin()}/live`
  );
};
