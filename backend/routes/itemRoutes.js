import express from "express";
import {
  addItem,
  deleteItem,
  editItem,
  getItemsByCity,
  getItemById,
  getItemsByShop,
  searchItems,
} from "../controllers/itemController.js";
const itemRouter = express.Router();
import { upload } from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.delete("/delete-item/:itemId", isAuth, deleteItem);
itemRouter.get("/get-items-by-city/:city", isAuth, getItemsByCity);
itemRouter.get("/get-items-by-shop/:shopId", isAuth, getItemsByShop);
itemRouter.get("/search-items", isAuth, searchItems);

export default itemRouter;
