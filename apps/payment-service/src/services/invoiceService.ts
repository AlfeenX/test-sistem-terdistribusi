import { prisma, type Invoice, type Payment } from "../lib/prisma.js";
import { createId } from "@gajayana/shared";

export async function createInvoice(data: {
  bookingId: string;
  userId: string;
  amount: number;
  dueAt: Date;
}): Promise<Invoice> {
  return prisma.invoice.create({
    data: {
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      dueAt: data.dueAt,
      status: "pending",
    },
  });
}

export async function findInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
  return prisma.invoice.findUnique({
    where: { bookingId },
  });
}

export async function findInvoiceById(id: string): Promise<Invoice | null> {
  return prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
}

export async function listInvoicesByUser(userId: string, limit = 50, offset = 0): Promise<Invoice[]> {
  return prisma.invoice.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
}

export async function createPayment(data: {
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
}): Promise<Payment> {
  const referenceNumber = `PAY-${createId()}`.replace(/\./g, "");
  return prisma.payment.create({
    data: {
      ...data,
      referenceNumber,
      status: "pending",
    },
  });
}

export async function markPaymentPaid(paymentId: string): Promise<Payment> {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "paid", paidAt: new Date() },
  });
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { status: "paid" },
  });
  return payment;
}

export async function markPaymentFailed(paymentId: string, _reason: string): Promise<Payment> {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: "failed" },
  });
}

export async function getPaymentMethods() {
  return prisma.paymentMethod.findMany({ orderBy: { name: "asc" } });
}
