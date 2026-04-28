import { Router } from "express";
import * as invoiceController from "../controllers/invoiceController.js";
import * as paymentController from "../controllers/paymentController.js";

export const invoiceRoutes: Router = Router();
invoiceRoutes.get("/methods", invoiceController.listPaymentMethods);
invoiceRoutes.get("/user/:userId", invoiceController.listMyInvoices);
invoiceRoutes.get("/:id", invoiceController.getInvoice);
invoiceRoutes.post("/payments", invoiceController.createPayment);
invoiceRoutes.post("/payments/:id/complete", paymentController.completePayment);
invoiceRoutes.post("/payments/:id/fail", paymentController.failPayment);
