import mongoose from "mongoose";

import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Invoice } from "../models/invoice.model.js";

function generateOrderNumber() {
  return `ORD-${Date.now()}`;
}

function generateInvoiceNumber() {
  return `INV-${Date.now()}`;
}

async function createOrderTransaction({
  companyId,
  customerId,
  items,
  subtotal,
  discount = 0,
  totalAmount,
  notes,
}) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    for (const item of items) {
      const inventory = await Inventory.findOne({
        companyId,
        productId: item.productId,
      }).session(session);

      if (!inventory) {
        throw new Error(`Inventory not found for ${item.productName}`);
      }

      const availableStock = inventory.quantity - inventory.reservedQuantity;

      if (availableStock < item.quantity) {
        throw new Error(
          `Insufficient inventory for ${item.productName}. Available: ${availableStock}, requested: ${item.quantity}`,
        );
      }
    }

    const [order] = await Order.create(
      [
        {
          companyId,
          customerId,

          orderNumber: generateOrderNumber(),

          status: "confirmed",

          subtotal,
          discount,
          totalAmount,

          paidAmount: 0,

          paymentStatus: "pending",

          notes,
        },
      ],
      { session },
    );

    const orderItems = items.map((item) => ({
      companyId,
      orderId: order._id,

      productId: item.productId,

      productName: item.productName,

      sku: item.sku,

      quantity: item.quantity,

      unit: item.unit,

      unitPrice: item.unitPrice,

      totalPrice: item.totalPrice,
    }));

    await OrderItem.insertMany(orderItems, { session });

    for (const item of items) {
      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          companyId,
          productId: item.productId,

          $expr: {
            $gte: [
              {
                $subtract: ["$quantity", "$reservedQuantity"],
              },
              item.quantity,
            ],
          },
        },
        {
          $inc: {
            reservedQuantity: item.quantity,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedInventory) {
        throw new Error(`Inventory reservation failed for ${item.productName}`);
      }
    }

    const invoiceTotal = totalAmount;

    const [invoice] = await Invoice.create(
      [
        {
          companyId,
          orderId: order._id,
          customerId,

          invoiceNumber: generateInvoiceNumber(),

          totalAmount: invoiceTotal,

          amountPaid: 0,

          amountDue: invoiceTotal,

          status: "unpaid",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    const createdOrder = await Order.findById(order._id).lean();

    const createdInvoice = await Invoice.findById(invoice._id).lean();

    return {
      order: createdOrder,
      invoice: createdInvoice,
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createOrder({
  companyId,
  customerId,
  items,
  subtotal,
  discount = 0,
  totalAmount,
  notes,
}) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await createOrderTransaction({
        companyId,
        customerId,
        items,
        subtotal,
        discount,
        totalAmount,
        notes,
      });
    } catch (error) {
      const isTransient = error?.errorLabels?.includes(
        "TransientTransactionError",
      );

      if (!isTransient || attempt === MAX_RETRIES) {
        throw error;
      }

      console.log(
        `Transaction conflict. Retrying (${attempt}/${MAX_RETRIES})...`,
      );
    }
  }
}
