export interface IApiEnv extends Env {
  AGENT_TUTOR_LIVE_SHARED_SECRET?: string;
  AGENT_TUTOR_LIVE_TOKEN_TTL_SECONDS?: string;
  BETTER_AUTH_ADMIN_TOKEN?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  BETTER_AUTH_URL: string;
  RUNNER_CODE_EXECUTOR_BASE_URL?: string;
}

const getLocalOriginAliases = (value: string): string[] => {
  try {
    const url = new URL(value);

    if (url.hostname === "localhost") {
      return [value, value.replace("localhost", "127.0.0.1")];
    }

    if (url.hostname === "127.0.0.1") {
      return [value, value.replace("127.0.0.1", "localhost")];
    }
  } catch {
    return [value];
  }

  return [value];
};

export const getTrustedOrigins = (env: IApiEnv): string[] => {
  const configuredOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(
    new Set(
      [env.BETTER_AUTH_URL, ...(configuredOrigins ?? [])].flatMap(
        getLocalOriginAliases,
      ),
    ),
  );
};

export const getAgentTutorLiveSharedSecret = (env: IApiEnv) => {
  if (!env.AGENT_TUTOR_LIVE_SHARED_SECRET) {
    throw new Error("AGENT_TUTOR_LIVE_SHARED_SECRET is not configured.");
  }

  return env.AGENT_TUTOR_LIVE_SHARED_SECRET;
};

export const getAgentTutorLiveTokenTtlSeconds = (env: IApiEnv) => {
  const ttlSeconds = Number(env.AGENT_TUTOR_LIVE_TOKEN_TTL_SECONDS ?? "60");

  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error("AGENT_TUTOR_LIVE_TOKEN_TTL_SECONDS must be positive.");
  }

  return ttlSeconds;
};
