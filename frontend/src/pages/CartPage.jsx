import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6 relative">
      <div
        className="absolute top-6 left-6 cursor-pointer z-20"
        onClick={() => navigate("/")}
      >
        <IoIosArrowBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[800px] mt-14">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-lg text-center">
            Your Cart is Empty
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4 space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard key={index} data={item} />
              ))}
            </div>

            <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
              <h1 className="text-lg font-semibold">Total Amount :</h1>
              <span className="text-xl font-bold text-[#ff4d2d]">
                ₹{totalAmount}
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium transition cursor-pointer"
                onClick={() => navigate("/checkout")}
              >
                Proceed To Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
