import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // 1️⃣ No token → UNAUTHORIZED
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: Token missing",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    // 3️⃣ User not found
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    // 4️⃣ Attach user to request
    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    // 5️⃣ Invalid / expired token
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default protect;
