import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createEditShop,
  getMyShop,
  deleteShop,
  getShopByCity,
} from "../controllers/shopController.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post("/create-edit", isAuth, upload.single("image"), createEditShop);
shopRouter.get("/get-my-shop", isAuth, getMyShop);
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity);
shopRouter.post("/delete-shop/:shopId", deleteShop);

export default shopRouter;
