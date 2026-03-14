"use client";

import { createAuthClient } from "better-auth/react";

import { resolveBrowserAddress } from "~/utils/runtime-url";

const baseURL = resolveBrowserAddress(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787",
);

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
