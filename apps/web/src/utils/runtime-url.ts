"use client";

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
