import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (mobile.length < 10) {
      return res.status(400).json({ message: "Mobile number must be at least 10 digits" });
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
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    const { password: _, ...userData } = user._doc;
    return res.status(201).json(userData);
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ message: `Signup failed: ${error.message}` });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user._doc;
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Signin Error:", error.message);
    return res.status(500).json({ message: `Signin failed: ${error.message}` });
  }
};


export const signOut = async (req, res) => {

  try{
    res.clearCookie("token");
    return res.status(200).json({message:"Logout successfully"});
  }
  catch(error) {
    return res.json(500).json(`sign out error ${error.message}`);
  }
}

export const sendOtp = async (req, res)=>{
  try{
    const {email} = req.body;
    
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({ message: "User does not exist" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5*60*1000;
    user.isOtpVerified = false;

    await user.save();
    await sendOtpMail(email, otp);

    return res.status(200).json({message:"OTP message successfully"});
  }
  catch(error){
    return res.status(400).json(`Send OTP error, ${error.message}`);
  }
}

export const verifyOtp = async (req, res) => {
  try{
    const {email, otp} = req.body;
    let user = await User.findOne({email});
    if(!user || user.resetOtp!==otp || user.otpExpires < Date.now()){
      return res.status(400).json({ message: "Invalid/expired otp" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({message:"OTP verified successfully"});
  }
  catch(error){
    return res.status(400).json(`Verify OTP error, ${error.message}`);
  }
}

export const resetPassword = async (req, res) => {
  try{
    const {email, password} = req.body;

    let user = await User.findOne({email});
    if(!user || !user.isOtpVerified){
      return res.status(400).json({ message: "OTP verification required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({message : "Password reset successfully"});
  }
  catch(error){
    return res.status(400).json(`Reset password error ${error.message}`);
  }
}

export const googleAuth = async(req, res) => {
  try{
    const {fullName, email, mobile, role} = req.body;
    let user = await User.findOne({email});

    if(!user){
      user= await User.create({fullName, email, mobile, role});
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    return res.status(200).json(user);
  }
  catch(error){
    return res.status(500).json(`google auth error ${error.message}`);
  }
}