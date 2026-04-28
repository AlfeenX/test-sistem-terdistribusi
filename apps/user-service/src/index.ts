import express from "express";
import { config } from "./config/index.js";
import { startSubscribers } from "./subscribers/index.js";
import { userRoutes } from "./routes/user.js";
import { membershipRoutes } from "./routes/membership.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("user-service");
const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/memberships", membershipRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "user-service" }));

async function main() {
  await startSubscribers();
  app.listen(config.port, () => log.info(`user-service listening on port ${config.port}`));
}

main().catch((err) => {
  log.error("Failed to start", err);
  process.exit(1);
});
