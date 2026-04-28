import type { Request, Response } from "express";
import * as invoiceService from "../services/invoiceService.js";
import { getLogger } from "@gajayana/shared";
import { getChannel } from "../subscribers/index.js";
import { publishPaymentCompleted, publishPaymentFailed } from "../publishers/paymentPublisher.js";

const log = getLogger("payment-service");

export async function completePayment(req: Request, res: Response): Promise<void> {
  try {
    const paymentId = req.params["id"]!;
    const payment = await invoiceService.markPaymentPaid(paymentId as string);
    const invoice = await invoiceService.findInvoiceById(payment.invoiceId);
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }
    const channel = getChannel();
    if (channel) {
      await publishPaymentCompleted(channel, {
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        bookingId: invoice.bookingId,
        userId: invoice.userId,
        amount: Number(payment.amount),
        paidAt: payment.paidAt!.toISOString(),
      });
    }
    res.json(payment);
  } catch (e) {
    log.error("completePayment failed", e);
    res.status(500).json({ error: "Failed to complete payment" });
  }
}

export async function failPayment(req: Request, res: Response): Promise<void> {
  try {
    const paymentId = req.params["id"]!;
    const reason = (req.body as { reason?: string }).reason ?? "Unknown";
    const payment = await invoiceService.markPaymentFailed(paymentId as string, reason);
    const invoice = await invoiceService.findInvoiceById(payment.invoiceId);
    if (invoice && invoice.bookingId) {
      const channel = getChannel();
      if (channel) {
        await publishPaymentFailed(channel, {
          invoiceId: invoice.id,
          bookingId: invoice.bookingId,
          reason,
          failedAt: new Date().toISOString(),
        });
      }
    }
    res.json(payment);
  } catch (e) {
    log.error("failPayment failed", e);
    res.status(500).json({ error: "Failed to mark payment failed" });
  }
}
