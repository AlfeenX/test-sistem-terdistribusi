import type { Request, Response } from "express";
import * as invoiceService from "../services/invoiceService.js";
import { getLogger } from "@gajayana/shared";

const log = getLogger("payment-service");

export async function getInvoice(req: Request, res: Response): Promise<void> {
  const invoice = await invoiceService.findInvoiceById(req.params["id"] as string);
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  res.json(invoice);
}

export async function listMyInvoices(req: Request, res: Response): Promise<void> {
  const userId = req.params["userId"]!;
  const limit = Math.min(100, parseInt(req.query["limit"] as string) || 50);
  const offset = parseInt(req.query["offset"] as string) || 0;
  const invoices = await invoiceService.listInvoicesByUser(userId as string, limit, offset);
  res.json(invoices);
}

export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    const { invoiceId, paymentMethodId, amount } = req.body as {
      invoiceId: string;
      paymentMethodId: string;
      amount: number;
    };
    if (!invoiceId || !paymentMethodId || amount == null) {
      res.status(400).json({ error: "invoiceId, paymentMethodId, amount required" });
      return;
    }
    const payment = await invoiceService.createPayment({ invoiceId, paymentMethodId, amount });
    res.status(201).json(payment);
  } catch (e) {
    log.error("createPayment failed", e);
    res.status(500).json({ error: "Failed to create payment" });
  }
}

export async function listPaymentMethods(_req: Request, res: Response): Promise<void> {
  const methods = await invoiceService.getPaymentMethods();
  res.json(methods);
}
