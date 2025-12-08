import React, { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUpdateOrderStatus } from "../redux/userSlice";

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch();

  const [availableBoys, setAvailableBoys] = useState(data.availableBoys || {});

  const totalAmount =
    data?.shopOrders?.reduce((sum, s) => sum + (s.subtotal || 0), 0) || 0;

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      const { shopOrder, availableBoys: apiBoys } = result.data;

      setAvailableBoys((prev) => ({
        ...prev,
        [shopId]: apiBoys,
      }));

      dispatch(
        setUpdateOrderStatus({
          orderId,
          shopId,
          status: shopOrder.status,
          availableBoys: { [shopId]: apiBoys },
        })
      );
    } catch (e) {
      console.log("Error updating status:", e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName}
        </h2>
        <p className="text-sm text-gray-500">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm mt-1 text-gray-600">
          <FaPhoneAlt />
          <span>{data?.user?.mobile}</span>
        </p>
      </div>

      <div className="text-sm text-gray-600">
        <p>{data?.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude}, Lon:{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {data?.shopOrders?.map((shopOrder) => (
        <div
          key={shopOrder._id}
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
        >
          <p className="font-semibold">{shopOrder?.shop?.name}</p>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder?.shopOrderItems?.map((item) => (
              <div
                key={item._id}
                className="w-40 border rounded-lg p-2 bg-white"
              >
                <img
                  src={item?.item?.image}
                  className="w-full h-24 object-cover rounded"
                  alt={item?.item?.name}
                />
                <p className="text-sm font-semibold mt-1">{item?.item?.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center border-t pt-2">
            <p className="text-sm">
              <span className="font-semibold">Status: </span>
              <span className="text-[#ff4d2d] font-semibold">
                {shopOrder.status}
              </span>
            </p>

            <select
              className="ml-auto border rounded px-3 py-1 text-sm text-[#ff4d2d]"
              value={shopOrder.status}
              onChange={(e) =>
                handleUpdateStatus(
                  data._id,
                  shopOrder?.shop?._id,
                  e.target.value
                )
              }
            >
              <option disabled>Change</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out for delivery">Out for delivery</option>
            </select>
          </div>

          {shopOrder.status === "out for delivery" && (
            <div className="mt-3 p-2 border rounded bg-orange-50 text-sm">
              {shopOrder?.assignedDeliveryBoy ? (
                <p className="font-semibold">Assigned Delivery Boys: </p>
              ) : (
                <p className="font-semibold">Available Delivery Boys: </p>
              )}

              {(availableBoys?.[shopOrder?.shop?._id] ?? []).length > 0 ? (
                availableBoys[shopOrder?.shop?._id].map((b) => (
                  <div key={b.id} className="text-gray-700">
                    {b.fullName} — {b.mobile}
                  </div>
                ))
              ) : shopOrder?.assignedDeliveryBoy ? (
                <div>
                  {shopOrder?.assignedDeliveryBoy?.fullName}-
                  {shopOrder?.assignedDeliveryBoy?.mobile}
                </div>
              ) : (
                <div>Waiting for delivery boys to accept.</div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="text-right text-lg font-semibold text-[#ff4d2d]">
        Total: ₹{totalAmount}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
