import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  console.log("data", data);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">Order #{data?._id?.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data?.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            {data?.paymentMethod?.toUpperCase()}
          </p>
          <p className="font-medium text-blue-600">
            {data?.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {/* Shop Orders */}
      {data?.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
        >
          <p className="font-semibold">{shopOrder?.shop?.name}</p>

          {/* Items */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder?.shopOrderItems?.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
              >
                <img
                  src={item?.item?.image}
                  alt={item?.item?.name}
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-sm font-semibold mt-1">{item?.item?.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item?.quantity} × ₹{item?.price}
                </p>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center border-t pt-2">
            <p>Subtotal : ₹{shopOrder?.subtotal}</p>
            <span>Status : {shopOrder?.status}</span>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data?.totalAmount}</p>
        <button
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          onClick={() => navigate(`/track-order/${data?._id}`)}
        >
          Track order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;
