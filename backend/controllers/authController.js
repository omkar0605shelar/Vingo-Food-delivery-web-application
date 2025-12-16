import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

/* ================= COOKIE OPTIONS ================= */
const cookieOptions = {
  httpOnly: true,
  secure: true, // REQUIRED on Render (HTTPS)
  sameSite: "none", // REQUIRED for cross-site cookies
  domain: ".onrender.com", // ⭐ FIX: SHARE COOKIE ACROSS SUBDOMAINS
  path: "/",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

/* ================= SIGN UP ================= */
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (!mobile || mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedPassword,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const { password: _, ...userData } = user._doc;
    return res.status(201).json(userData);
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/* ================= SIGN IN ================= */
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const { password: _, ...userData } = user._doc;
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Signin Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

/* ================= SIGN OUT ================= */
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      ...cookieOptions,
      expires: new Date(0),
    });

    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= SEND OTP ================= */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    await sendOtpMail(email, otp);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isOtpVerified = false;

    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= GOOGLE AUTH ================= */
export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, cookieOptions);

    const { password, ...userData } = user._doc;
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: userData,
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
