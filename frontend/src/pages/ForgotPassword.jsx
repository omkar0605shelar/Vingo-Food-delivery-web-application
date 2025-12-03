import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { IoMdArrowBack } from "react-icons/io";
import axios from "axios";
import { ClipLoader } from "react-spinners";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const borderColor = "#ddd";
  const primaryColor = "#ff4d2d";

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );

      console.log(result);
      setErr("");
      setLoading(false);
      setStep(step + 1);
    } catch (error) {
      console.log("Error while sending params to send-otp route");
      console.log(error.message);
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      console.log(result);
      setErr("");
      setStep(step + 1);
      setLoading(false);
    } catch (error) {
      console.log("Error while sending otp to verify-otp route");
      console.log(error.message);
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPass) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, password },
        { withCredentials: true }
      );

      console.log(result);
      setErr("");
      navigate("/signin");
      setLoading(false);
    } catch (error) {
      console.log("Error while reset pssword");
      console.log(error.message);
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-full justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoMdArrowBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => {
              navigate("/signin");
            }}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>

        {step == 1 && (
          <div>
            {/* Email */}
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                className="w-full b-[1px] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                placeholder="Enter your email"
                style={{ border: `1px solid ${borderColor}` }}
                required
                value={email}
              />
            </div>

            <button
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 transition duration-200 text-white cursor-pointer hover:bg-[#e64323]"
              style={{ backgroundColor: primaryColor }}
              onClick={handleSendOtp}
              value={step}
            >
              {loading ? <ClipLoader size={20} /> : "Send OTP"}
            </button>
            {err && <p className="text-red-500 text-center my-[10px]">{err}</p>}
          </div>
        )}

        {step == 2 && (
          <div>
            {/* OTP */}
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="otp"
              >
                OTP
              </label>
              <input
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
                type="text"
                className="w-full b-[1px] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                placeholder="Enter OTP"
                style={{ border: `1px solid ${borderColor}` }}
                value={otp}
                required
              />
            </div>

            <button
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 transition duration-200 text-white cursor-pointer hover:bg-[#e64323]"
              style={{ backgroundColor: primaryColor }}
              onClick={handleVerifyOtp}
            >
              {loading ? <ClipLoader size={20} /> : "Verify OTP"}
            </button>
            {err && <p className="text-red-500 text-center my-[10px]">{err}</p>}
          </div>
        )}

        {step == 3 && (
          <div>
            {/* OTP */}
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="password"
              >
                New Password :{" "}
              </label>
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="text"
                className="w-full b-[1px] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                placeholder="Enter new password"
                style={{ border: `1px solid ${borderColor}` }}
                value={password}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="confirmPass"
              >
                Confirm Password :{" "}
              </label>
              <input
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                }}
                type="password"
                className="w-full b-[1px] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                placeholder="Enter new password"
                style={{ border: `1px solid ${borderColor}` }}
                value={confirmPass}
                required
              />
            </div>

            <button
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 transition duration-200 text-white cursor-pointer hover:bg-[#e64323]"
              style={{ backgroundColor: primaryColor }}
              onClick={handleResetPassword}
            >
              {loading ? <ClipLoader size={20} /> : "Reset Password"}
            </button>
            {err && <p className="text-red-500 text-center my-[10px]">{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
