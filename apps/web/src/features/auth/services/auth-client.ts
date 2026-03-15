"use client";

import { createAuthClient } from "better-auth/react";

import { getBrowserApiBaseUrl, resolveBrowserAddress } from "~/utils/runtime-url";

const baseURL = resolveBrowserAddress(
  getBrowserApiBaseUrl(),
);

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
