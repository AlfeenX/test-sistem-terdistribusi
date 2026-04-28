import express from "express";
import { config } from "./config/index.js";
import { startSubscribers } from "./subscribers/index.js";
import { facilityRoutes } from "./routes/facility.js";
import { slotRoutes } from "./routes/slot.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("field-service");
const app = express();
app.use(express.json());

app.use("/facilities", facilityRoutes);
app.use("/slots", slotRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "field-service-2" }));

async function main() {
  await startSubscribers();
  app.listen(config.port, () => log.info(`field-service-2 listening on port ${config.port}`));
}

main().catch((err) => {
  log.error("Failed to start", err);
  process.exit(1);
});
