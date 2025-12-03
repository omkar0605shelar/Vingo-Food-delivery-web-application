import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUpdateOrderStatus } from "../redux/userSlice";

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch();
  const totalAmount =
    data?.shopOrders?.reduce((sum, shop) => sum + (shop.subtotal || 0), 0) || 0;

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      console.log("SHOP ID:", shopId);
      console.log("ORDER ID:", orderId);

      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(setUpdateOrderStatus({ orderId, shopId, status }));
      console.log(result.data);
    } catch (e) {
      console.log("error", e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName || "Unknown User"}
        </h2>
        <p className="text-sm text-gray-500">
          {data?.user?.email || "No email"}
        </p>

        <p className="flex items-center gap-2 text-sm mt-1 text-gray-600">
          <FaPhoneAlt />
          <span>{data?.user?.mobile || "No phone"}</span>
        </p>
      </div>

      <div className="flex flex-col gap-1 text-gray-600 text-sm">
        <p>{data?.deliveryAddress?.text || "No address available"}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude ?? "N/A"}, Lon:{" "}
          {data?.deliveryAddress?.longitude ?? "N/A"}
        </p>
      </div>

      {data?.shopOrders?.map((shopOrder, idx) => (
        <div key={idx} className="border rounded-lg p-3 bg-[#fffaf7] space-y-3">
          <p className="font-semibold">
            {shopOrder?.shop?.name || "Unknown Shop"}
          </p>

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

          <div className="flex items-center border-t pt-2">
            <div className="text-sm">
              <span className="font-semibold">Status: </span>
              <span className="text-[#ff4d2d] font-semibold">
                {shopOrder.status}
              </span>
            </div>

            <select
              className="ml-auto rounded-md border px-3 py-1 text-sm 
                         focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d] cursor-pointer"
              onChange={(e) =>
                handleUpdateStatus(
                  data._id,
                  shopOrder?.shop?._id,
                  e.target.value
                )
              }
            >
              <option value="">Change</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out for delivery">Out for delivery</option>
            </select>
          </div>
        </div>
      ))}

      <div className="text-right font-semibold text-lg text-[#ff4d2d]">
        Total: ₹{totalAmount}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
