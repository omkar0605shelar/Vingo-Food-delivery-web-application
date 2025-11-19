import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAddToCart } from "../redux/userSlice";

function FoodCard({ data }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);

  const cartItems = useSelector((state) => state.user?.cartItems || []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar className="text-yellow-500 text-lg" />
        )
      )
    }
    return stars;
  };

  const handleIncrease = () => setQuantity(quantity + 1);

  const handleDecrease = () => {
    if (quantity > 0) setQuantity(quantity - 1);
  };

  const alreadyInCart = cartItems.some((i) => i._id === data._id);

  return (
    <div className="w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative w-full h-[170px] flex justify-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>

        <img
          src={data.image}
          alt={data.name}
          className="w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data.name}
        </h1>

        <div className="flex items-center gap-1 mt-1">
          {renderStars(data?.rating?.average || 0)}
          <span>{data?.rating?.count || 0}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto p-3">
        <span className="font-bold text-gray-900 text-lg">₹{data.price}</span>

        <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
          <button className="px-2 py-1 hover:bg-gray-100" onClick={handleDecrease}>
            <FaMinus size={12} />
          </button>

          <span className="px-2">{quantity}</span>

          <button className="px-2 py-1 hover:bg-gray-100" onClick={handleIncrease}>
            <FaPlus size={12} />
          </button>

          <button
            className={`${alreadyInCart ? "bg-gray-800" : "bg-[#ff4d2d]"
              } text-white px-3 py-2 transition-colors cursor-pointer`}
            onClick={() => {
              if (quantity === 0) return;

              dispatch(
                setAddToCart({
                  _id: data._id, 
                  name: data.name,
                  price: data.price,
                  image: data.image,
                  shop: data.shop,
                  quantity,
                  foodType: data.foodType,
                })
              );
            }}
          >
            <FaShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
