import { Hono, type Context } from "hono";

import type { getSessionFromHeaders } from "./auth";
import type { IApiEnv } from "./env";

export interface IApiVariables {
  session: Awaited<ReturnType<typeof getSessionFromHeaders>>;
}

export interface IApiHonoEnv {
  Bindings: IApiEnv;
  Variables: IApiVariables;
}

export type TApiContext = Context<IApiHonoEnv>;

export const createApiApp = () => new Hono<IApiHonoEnv>();
