import { getMigrations } from "better-auth/db/migration";

import { getAuth } from "../../../utils/auth";
import { SMigrationResponse } from "./schemas";
import type { TApiContext } from "../../../utils/hono";

export const runMigrationsHandler = async (c: TApiContext) => {
  if (
    !c.env.BETTER_AUTH_ADMIN_TOKEN ||
    c.req.header("x-admin-token") !== c.env.BETTER_AUTH_ADMIN_TOKEN
  ) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const auth = getAuth(c.env);
  const { runMigrations, toBeAdded, toBeCreated } = await getMigrations(
    auth.options,
  );

  if (!toBeAdded.length && !toBeCreated.length) {
    return c.json(SMigrationResponse.parse({ message: "No migrations needed" }));
  }

  await runMigrations();

  return c.json(
    SMigrationResponse.parse({
      message: "Migrations completed",
      created: toBeCreated.map((entry) => entry.table),
      added: toBeAdded.map((entry) => entry.table),
    }),
  );
};
