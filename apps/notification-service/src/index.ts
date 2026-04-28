import express from "express";
import { config } from "./config/index.js";
import { startSubscribers } from "./subscribers/index.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("notification-service");
const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "notification-service" }));

async function main() {
  await startSubscribers();
  app.listen(config.port, () => log.info(`notification-service listening on port ${config.port}`));
}

main().catch((err) => {
  log.error("Failed to start", err);
  process.exit(1);
});
