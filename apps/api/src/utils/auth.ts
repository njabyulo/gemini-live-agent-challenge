import { betterAuth } from "better-auth";
import type { ISessionSummary } from "@agent-tutor/shared/types";

import { getTrustedOrigins, type IApiEnv } from "./env";

export const getAuth = (env: IApiEnv) =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: env.DB,
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: getTrustedOrigins(env),
  });

export const getSessionFromHeaders = async (
  env: IApiEnv,
  headers: Headers,
): Promise<ISessionSummary | null> => {
  const auth = getAuth(env);
  const session = await auth.api.getSession({ headers });

  if (!session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt.toISOString(),
    },
  };
};
