import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user || {});
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [availableAssignments, setAvailableAssignments] = useState([]);

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data || []);
      console.log("Assignments fetched:", result.data);
    } catch (e) {
      console.error("Error fetching assignments:", e);
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      console.log(result.data);

      await getCurrentOrder();
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const sendOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true }
      );
      setShowOtpBox(true);
      console.log(result.data);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      console.log(result.data);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        {
          withCredentials: true,
        }
      );
      setCurrentOrder(result.data);
      console.log(result.data);
    } catch (e) {
      console.log("Error while getCurrentOrder: ", e);
    }
  };

  useEffect(() => {
    if (userData) {
      getAssignments();
      getCurrentOrder();
    }
  }, [userData]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      <div className="w-full max-w-[900px] flex flex-col gap-5 items-center">
        {/* ------ USER INFO CARD ------ */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100 text-center">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullName ?? "Delivery Boy"}
          </h1>

          <p className="text-[#ff4d2d]">
            <span className="font-semibold">Latitude:</span>{" "}
            {userData?.location?.coordinates?.[1] ?? "N/A"},{" "}
            <span className="font-semibold">Longitude:</span>{" "}
            {userData?.location?.coordinates?.[0] ?? "N/A"}
          </p>
        </div>

        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4">Available Orders</h1>
            <div className="space-y-4">
              {availableAssignments.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 flex justify-between items-start shadow-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">
                        {a?.shopName ?? "Shop Name"}
                      </p>

                      <p className="text-sm text-gray-600 leading-tight">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a?.deliveryAddress?.text ?? "Not available"}
                      </p>

                      <p className="text-sm text-gray-600">
                        {a?.items?.length ?? 0} items | ₹{a?.subtotal ?? 0}
                      </p>
                    </div>
                    <button
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 cursor-pointer"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {currentOrder && (
          <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">Current Order: </h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder.deliveryAddress.text}
              </p>
              <p className="text-sm text-gray-600">
                {currentOrder.shopOrder.shopOrderItems.length ?? 0} items | ₹
                {currentOrder.shopOrder.subtotal ?? 0}
              </p>
            </div>
            <DeliveryBoyTracking data={currentOrder} />
            {!showOtpBox ? (
              <button
                className="mt-4 bg-green-500 font-semibold hover:bg-green-600 w-full text-white py-2 px-4 rounded-xl shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                onClick={sendOtp}
              >
                Mark as delivered.
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter Otp send to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user.fullName}
                  </span>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                  />
                  <button
                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all cursor-pointer"
                    onClick={verifyOtp}
                  >
                    Submit OTP
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
