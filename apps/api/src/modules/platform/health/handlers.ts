import { SHealthResponse } from "./schemas";
import type { TApiContext } from "../../../utils/hono";

export const getHealthHandler = (c: TApiContext) =>
  c.json(SHealthResponse.parse({ status: "ok" }));
