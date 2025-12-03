import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";

function MyOrders() {
  const navigate = useNavigate();
  const { userData, myOrders } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-screen flex justify-center px-4 bg-[#fff9f6] ">
      <div className="w-full max-w-[800px] p-4">
        {/* Header */}
        <div className="flex items-center gap-5 mb-6">
          <IoIosArrowRoundBack
            size={35}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/")}
          />
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {myOrders.map((order, index) =>
            userData?.role === "user" ? (
              <UserOrderCard data={order} key={index} />
            ) : userData?.role === "owner" ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
