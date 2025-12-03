import Shop from "../models/shopModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

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
        if (!shop) return res.status(400).json({ message: "Shop not found" });

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

    // OWNER
    if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .select(
          "deliveryAddress paymentMethod totalAmount shopOrders createdAt"
        );

      const filteredOrders = orders.map((order) => ({
        _id: order?._id,
        paymentMethod: order?.paymentMethod,
        user: order?.user,
        createdAt: order?.createdAt,
        deliveryAddress: order?.deliveryAddress,
        shopOrders: order?.shopOrders?.filter(
          (s) => s.owner.toString() === req.userId.toString()
        ),
      }));

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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId.toString()
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shop Order not found" });
    }

    shopOrder.status = status;

    await order.save();

    return res.status(200).json({ status: shopOrder.status });
  } catch (e) {
    return res.status(500).json({ message: `order status error ${e}` });
  }
};
