import { Order } from "../models/order.model.js";

export async function getOrders(req, res) {
  try {
    const companyId = process.env.WHATSAPP_COMPANY_ID;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const orders = await Order.find({
      companyId,
    })
      .populate("customerId", "name phone email address")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const companyId = process.env.WHATSAPP_COMPANY_ID;

    const { id } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const order = await Order.findOne({
      _id: id,
      companyId,
    }).populate("customerId", "name phone email address");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
}
