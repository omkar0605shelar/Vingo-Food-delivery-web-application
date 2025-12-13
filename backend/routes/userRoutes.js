import express from "express";
import {
  getCurrentUser,
  updateUserLocation,
} from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, protect, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);

export default userRouter;
