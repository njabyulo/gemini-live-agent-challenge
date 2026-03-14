import type { Sandbox } from "@cloudflare/sandbox";

export interface IApiEnv extends Omit<Env, "Sandbox"> {
  BETTER_AUTH_ADMIN_TOKEN?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  BETTER_AUTH_URL: string;
  Sandbox: DurableObjectNamespace<Sandbox>;
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
