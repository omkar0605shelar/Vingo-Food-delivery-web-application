import { IoIosArrowBack } from "react-icons/io";
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { BiCurrentLocation } from "react-icons/bi";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setLocation, setMapAddress } from "../redux/mapSlice";
import axios from "axios";
import { useState, useEffect } from "react";
import { serverUrl } from "../App";
import { setAddMyOrder } from "../redux/userSlice";

function RecenterMap({ location }) {
  const map = useMap();
  if (location.lat && location.lon) {
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

function CheckOut() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { location, address } = useSelector((state) => state.map);
  const { userData, cartItems, totalAmount } = useSelector(
    (state) => state.user
  );
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const amountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getAddressByLatLng = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`,
        { withCredentials: false }
      );

      const info = res?.data?.results?.[0];
      if (!info) return;

      dispatch(
        setMapAddress(
          `${info?.address_line1 || ""}, ${info?.address_line2 || ""}, ${
            info?.city || ""
          }, ${info?.state || ""}, ${info?.postcode || ""}`
        )
      );
    } catch (err) {
      console.log("Reverse geocode error:", err);
    }
  };

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAddressByLatLng(latitude, longitude);
  };

  const getLatLngByAddress = async () => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apiKey}`,
        { withCredentials: false }
      );

      const info = res?.data?.features?.[0]?.properties;

      if (!info) {
        alert("Address not found. Try again.");
        return;
      }

      dispatch(setLocation({ lat: info.lat, lon: info.lon }));

      dispatch(
        setMapAddress(
          `${info.address_line1 || ""}, ${info.address_line2 || ""}, ${
            info.city || ""
          }, ${info.state || ""}, ${info.postcode || ""}`
        )
      );
    } catch (err) {
      console.log("Forward geocode error:", err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          cartItems,
          totalAmount,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
        },
        { withCredentials: true }
      );

      if (paymentMethod == "cod") {
        console.log(result?.data);
        dispatch(setAddMyOrder(result?.data));
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (e) {
      console.log("Error occuring while handle placing order");
      console.log(e);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Vingo",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            { razorpay_payment_id: response.razorpay_payment_id, orderId },
            { withCredentials: true }
          );
          console.log(result?.data);
          dispatch(setAddMyOrder(result?.data));
          navigate("/order-placed");
        } catch (e) {
          console.log("error while verifying online payment");
          console.log(e);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    setAddressInput(address || "");
  }, [address]);

  if (!location.lat || !location.lon) {
    return <h2 className="text-center p-5">Loading map...</h2>;
  }

  return (
    <>
      <div
        className="absolute top-[20px] left-[20px] z-[10] cursor-pointer"
        onClick={() => navigate("/cart")}
      >
        <IoIosArrowBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

          <section>
            <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
              <IoLocationSharp className="text-[#ff4d2d]" />
              Delivery Location
            </h2>

            {/* 🟢 Input + Search + GPS buttons */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                placeholder="Enter your delivery address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />

              <button
                className="bg-[#ff4d2d] text-white px-3 py-2 rounded-lg"
                onClick={getLatLngByAddress}
              >
                <IoSearchOutline size={17} />
              </button>

              <button
                className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                onClick={getCurrentLocation}
              >
                <BiCurrentLocation size={17} />
              </button>
            </div>

            {/* 🟢 Map */}
            <div className="rounded-xl border overflow-hidden">
              <div className="h-64 w-full">
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <RecenterMap location={location} />

                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                </MapContainer>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  paymentMethod === "cod"
                    ? "border-[#ff4d2d] bg-orange-50 shadow"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <MdDeliveryDining className="text-green-600 text-xl" />
                </span>

                <div>
                  <p className="font-medium text-gray-800">Cash On Delivery</p>
                  <p className="text-xs text-gray-500">
                    Pay when your food arrives
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  paymentMethod === "online"
                    ? "border-[#ff4d2d] bg-orange-50 shadow"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("online")}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <FaMobileScreenButton className="text-purple-700 text-lg " />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <FaCreditCard className="text-blue-700 text-lg" />
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    UPI / Credit / Debit Card
                  </p>
                  <p className="text-xs text-gray-500">Pay Securely Online</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Order Summary
            </h2>

            <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>
                    {item.name} X {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr className="border-gray-200 my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{totalAmount}</span>
              </div>
              <div className="flex justify-between text-medium text-gray-700">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : deliveryFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
                <span>Total Amount</span>
                <span>{amountWithDeliveryFee}</span>
              </div>
            </div>
          </section>

          <button
            className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer"
            onClick={handlePlaceOrder}
          >
            {paymentMethod === "cod" ? "Place order" : "Pay & place order"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CheckOut;
