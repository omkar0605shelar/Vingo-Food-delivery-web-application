import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id; // ✅ THIS LINE FIXES EVERYTHING

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default isAuth;
