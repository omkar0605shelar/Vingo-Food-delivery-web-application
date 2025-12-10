import Shop from "../models/shopModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import DeliveryAssignment from "../models/deliveryAssignmentModel.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, deliveryAddress, paymentMethod, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Incomplete delivery address" });
    }

    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) throw new Error("Shop not found for id " + shopId);

        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i._id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");

    return res.status(201).json(newOrder);
  } catch (e) {
    return res.status(500).json({ message: `place order error ${e}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // USER
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    }

    if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "shopOrders.shop",
          select: "name",
        })
        .populate({
          path: "shopOrders.owner",
          select: "fullName email mobile",
        })
        .populate({
          path: "shopOrders.shopOrderItems.item",
          select: "name image price",
        })
        .populate({
          path: "user",
          select: "fullName email mobile",
        })
        .populate({
          path: "shopOrders.assignedDeliveryBoy",
          select: "fullName mobile",
        });

      const filteredOrders = orders.map((order) => {
        const ownerShopOrders = order.shopOrders.filter(
          (s) => s.owner && s.owner._id.toString() === req.userId.toString()
        );

        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          user: order.user,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          shopOrders: ownerShopOrders,
        };
      });

      return res.status(200).json(filteredOrders);
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (e) {
    return res.status(500).json({ message: `get user Order error ${e}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    // Fetch order with required fields
    const order = await Order.findById(orderId)
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.assignedDeliveryBoy", "fullName mobile email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find specific shopOrder
    const shopOrder = order.shopOrders.find(
      (o) => o.shop._id.toString() === shopId.toString()
    );

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    // Update status
    shopOrder.status = status;

    let deliveryBoysPayload = [];

    // 🚨 PREVENT DUPLICATE ASSIGNMENT CREATION
    if (status === "out for delivery") {
      if (shopOrder.assignment) {
        console.log("Assignment already exists. Skipping duplicate creation.");

        return res.status(200).json({
          message: "Assignment already exists",
          shopOrder,
          assignment: shopOrder.assignment,
        });
      }

      const { longitude, latitude } = order.deliveryAddress;

      // Find all nearby delivery boys (geospatial)
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);

      // Find busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busySet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busySet.has(String(b._id))
      );

      const candidates = availableBoys.map((b) => b._id);

      // If no candidates found
      if (candidates.length === 0) {
        await order.save();
        return res.json({
          message: "Order updated but no delivery boys available",
          shopOrder,
          availableBoys: [],
        });
      }

      // Create assignment
      const assignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop._id,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      shopOrder.assignment = assignment._id;
      shopOrder.assignedDeliveryBoy = null;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        mobile: b.mobile,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
      }));
    }

    // Save updated order
    await order.save();

    const updatedShopOrder = order.shopOrders.find(
      (o) => o.shop._id.toString() === shopId.toString()
    );

    return res.status(200).json({
      message: "Status updated successfully",
      shopOrder: updatedShopOrder,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
    });
  } catch (e) {
    console.error("Update status error:", e);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

export const getDeliveryBoyAsssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));

    return res.status(200).json(formated);
  } catch (e) {
    return res
      .json(500)
      .json({ message: `get assignment error, ${e.message}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }

    if (assignment.status != "brodcasted") {
      return res.status(400).json({ message: "ASsignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["completed", "brodcasted"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You are already assigned to another order." });
    }

    assignment.assignedTo = req.userId;
    assignment.acceptedAt = new Date();
    assignment.status = "assigned";

    await assignment.save();

    const order = await Order.findById(assignment.order);

    if (!order) {
      return res.status(400).json({ message: "assignment is expired." });
    }

    let shopOrder = order?.shopOrders?.find((so) =>
      so._id.equals(assignment.shopOrderId)
    );

    if (shopOrder) {
      shopOrder.assignedDeliveryBoy = req.userId;
    }

    order.markModified("shopOrders");

    await order.save();

    return res.status(200).json({ message: "ORder accepted." });
  } catch (e) {
    return res.status(500).json({ message: `accept order status: ${e}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found." });
    }

    if (!assignment.order) {
      return res.status(400).json({ message: "Order not found." });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => toString(so._id) == toString(assignment.shopOrderId)
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "ShopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (e) {
    return res.status(500).json({ message: `get current order error: ${e}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobile")
      .populate("shopOrders.shop", "name")
      .populate(
        "shopOrders.assignedDeliveryBoy",
        "fullName mobile email location"
      )
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .lean();

    if (!order) {
      return res.status(400).json({ message: "Order not found." });
    }

    return res.status(200).json(order);
  } catch (e) {
    return res.status(500).json({ message: `get by id order error ${e}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");

    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter valid order/shopOrderId" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

    await order.save();
    await sendDeliveryOtpMail(order.user, otp);

    return res
      .status(200)
      .json({ message: `Otp send successfully ${order?.user?.fullName}` });
  } catch (e) {
    return res
      .status(500)
      .json({ message: `Error while sending delivery otp ${e}` });
  }
};

export const verifiedDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;

    // FIND ORDER
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter valid order/shopOrderId" });
    }

    // OTP VALIDATION
    if (
      shopOrder.deliveryOtp != otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/expired OTP" });
    }

    // UPDATE SHOP ORDER STATUS
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();

    // 🔥 REMOVE DELIVERY BOY ASSIGNMENT (IMPORTANT)
    const deliveryBoyId = shopOrder.assignedDeliveryBoy;
    shopOrder.assignedDeliveryBoy = null;

    // DELETE DELIVERY ASSIGNMENT ENTRY
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      orderId: order._id,
      assignedTo: deliveryBoyId,
    });

    // 🔥 ALSO REMOVE CURRENT ORDER FROM DELIVERY BOY DOCUMENT
    await DeliveryBoy.updateOne(
      { _id: deliveryBoyId },
      { $set: { currentOrder: null } }
    );

    await order.save();

    return res.status(200).json({ message: "Order delivered successfully." });
  } catch (e) {
    return res.status(500).json({
      message: `error while verified delivery otp : ${e.message}`,
    });
  }
};
