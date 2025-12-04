import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        { name, city, state, address, image },
        { new: true }
      );
    }

    shop = await Shop.findById(shop._id).populate("owner").populate("items");

    return res.status(201).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create/Edit shop error: ${error.message}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate("items");
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (!shop.items || shop.items.length === 0) {
      shop.items = [];
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.log("Error in get-my-shop:", error);
    return res
      .status(500)
      .json({ message: `Get shop error: ${error.message}` });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    console.log("CITY RECEIVED:", city);

    const shops = await Shop.find({
      city: { $regex: city, $options: "i" },
    }).populate("items");

    console.log("SHOPS FOUND:", shops.length);
    return res.status(200).json(shops);
  } catch (error) {
    console.error("getShopByCity error:", error);
    return res.status(500).json({ message: "getShopByCity error", error });
  }
};

export const deleteShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({ message: "Shop ID is required" });
    }

    const deletedShop = await Shop.findByIdAndDelete(shopId);

    if (!deletedShop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    await Item.deleteMany({ shop: shopId });

    return res.status(200).json({ message: "Shop deleted successfully" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: `error while delete shop , ${e.message}` });
  }
};
