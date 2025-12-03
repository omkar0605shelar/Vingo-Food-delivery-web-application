import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { TbReceiptDollar } from "react-icons/tb";
import { CiShoppingCart } from "react-icons/ci";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function Nav() {
  const cartItems = useSelector((state) => state.user?.cartItems || []);
  const { userData, currentCity } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/sign-out`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible shadow-md">
      {/* Logo */}
      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Vingo</h1>

      {/* Search Bar for user */}
      {userData?.role === "user" && (
        <>
          <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] ml-10 md:flex hidden mr-5">
            <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
              <FaLocationDot size={25} className="text-[#ff4d2d]" />
              <div className="w-[80%] truncate text-gray-600">
                {currentCity || "Fetching city..."}
              </div>
            </div>

            <div className="w-[80%] flex items-center gap-[10px]">
              <CiSearch size={25} className="text-[#ff4d2d]" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="px-[10px] text-gray-700 outline-0 w-full"
              />
            </div>

            <CiSearch size={25} className="text-[#ff4d2d] md:hidden " />
            <div
              className="relative cursor-pointer mr-5"
              onClick={() => navigate("/cart")}
            >
              <CiShoppingCart size={25} className="text-[#ff4d2d]" />
              <span className="absolute right-[-5px] top-[-12px] text-[#ff4d2d] font-bold">
                {cartItems.length}
              </span>
            </div>
            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium mr-5 cursor-pointer"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </div>
        </>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Owner UI */}
        {userData?.role === "owner" && (
          <>
            {myShopData && (
              <>
                <button
                  className="flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>
                <button
                  className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium mr-5 cursor-pointer"
                  onClick={() => navigate("/my-orders")}
                >
                  My Orders
                </button>
              </>
            )}
          </>
        )}

        {/* Profile Icon */}
        <div
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1).toUpperCase() || "?"}
        </div>

        {/* Dropdown Info */}
        {showInfo && (
          <div className="fixed top-[80px] right-[10px] md:right-[10%] lg:right-[25%] w-[180px] bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-[10px] z-[9999]">
            <div className="text-[17px] font-semibold">
              {userData?.fullName || "Guest"}
            </div>
            <div
              className="text-[#ff4d2d] font-semibold cursor-pointer hover:underline"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
