import {
  signLiveSessionToken,
} from "@gemini-live-agent/shared/utils";
import type { ILiveSessionTokenResponse } from "@gemini-live-agent/shared/types";

import type { TApiContext } from "../../../utils/hono";
import {
  getAgentTutorLiveSharedSecret,
  getAgentTutorLiveTokenTtlSeconds,
} from "../../../utils/env";

import {
  SLiveSessionTokenResponse,
  SUnauthorizedLiveSessionTokenResponse,
} from "./schemas";
import { requireLiveSessionTokenSession } from "./utils";

export const createLiveSessionTokenHandler = async (c: TApiContext) => {
  const session = requireLiveSessionTokenSession(c);

  if (!session) {
    return c.json(
      SUnauthorizedLiveSessionTokenResponse.parse({ token: null }),
      401,
    );
  }

  const ttlSeconds = getAgentTutorLiveTokenTtlSeconds(c.env);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((nowSeconds + ttlSeconds) * 1000).toISOString();
  const token = await signLiveSessionToken({
    claims: {
      aud: "agent-tutor-live",
      email: session.user.email,
      exp: nowSeconds + ttlSeconds,
      iat: nowSeconds,
      scope: "live:connect",
      sid: session.session.id,
      sub: session.user.id,
    },
    secret: getAgentTutorLiveSharedSecret(c.env),
  });

  return c.json(
    SLiveSessionTokenResponse.parse({
      expiresAt,
      token,
    } satisfies ILiveSessionTokenResponse),
  );
};
