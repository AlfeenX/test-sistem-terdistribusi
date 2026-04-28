import express from "express";
import { config } from "./config/index.js";
import { startSubscribers } from "./subscribers/index.js";
import { invoiceRoutes } from "./routes/invoice.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("payment-service");
const app = express();
app.use(express.json());

app.use("/invoices", invoiceRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "payment-service" }));

async function main() {
  await startSubscribers();
  app.listen(config.port, () => log.info(`payment-service listening on port ${config.port}`));
}

main().catch((err) => {
  log.error("Failed to start", err);
  process.exit(1);
});
