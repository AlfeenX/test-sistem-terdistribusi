import express from "express";
import { config } from "./config/index.js";
import { startSubscribers } from "./subscribers/index.js";
import { bookingRoutes } from "./routes/booking.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("booking-service");
const app = express();
app.use(express.json());

app.use("/bookings", bookingRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "booking-service" }));

async function main() {
  await startSubscribers();
  app.listen(config.port, () => log.info(`booking-service listening on port ${config.port}`));
}

main().catch((err) => {
  log.error("Failed to start", err);
  process.exit(1);
});
