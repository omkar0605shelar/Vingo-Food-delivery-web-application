import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    let { name, foodType, category, price } = req.body;
    price = Number(price);

    if (!name || !category || !foodType || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    let image;
    if (req.file && req.file.path) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(201).json({
      message: "Item added successfully",
      shop,
    });
  } catch (error) {
    return res.status(500).json({ message: `addItem error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    let { name, foodType, category, price } = req.body;

    price = Number(price);
    if (isNaN(price)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const updateData = {
      name,
      foodType,
      category,
      price,
    };

    if (image) {
      updateData.image = image;
    }

    const item = await Item.findByIdAndUpdate(itemId, updateData, {
      new: true,
    });

    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item updated", item });
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });

    // FIXED FILTER
    shop.items = shop.items.filter((i) => i.toString() !== item._id.toString());

    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json({ shop, items: shop.items });
  } catch (error) {
    return res.status(500).json({ message: "delete item error", error });
  }
};

export const getItemsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    console.log("CITY RECEIVED:", city);

    const shops = await Shop.find({
      city: { $regex: city, $options: "i" },
    }).populate("items");

    console.log("SHOPS FOUND:", shops.length);

    const allItems = shops.flatMap((shop) => shop.items || []);
    console.log("ITEMS FOUND:", allItems.length);

    return res.status(200).json(allItems);
  } catch (error) {
    console.error("getItemsByCity error:", error);
    return res.status(500).json({ message: "getItemsByCity error", error });
  }
};
