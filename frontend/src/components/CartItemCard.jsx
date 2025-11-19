import { FaMinus, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setRemoveCartItem, setUpdateQuantity } from "../redux/userSlice";

function CartItemCard({ data }) {
  const dispatch = useDispatch();

  const handleIncrease = (id, qty) => {
    dispatch(setUpdateQuantity({ id, quantity: qty + 1 }));
  };

  const handleDecrease = (id, qty) => {
    if (qty > 0) {
      dispatch(setUpdateQuantity({ id, quantity: qty - 1 }));
    }
  };

  const handleDeleteCartItem = (id) => {
    dispatch(setRemoveCartItem(id));
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
      <div className="flex items-center gap-4">
        <img
          src={data?.image}
          alt={data?.name}
          className="w-[80px] h-[80px] object-cover rounded-lg border"
        />
        <div>
          <h1 className="font-medium text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-500 ">
            {data.price} × {data.quantity}
          </p>
          <p className="font-bold text-gray-900">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* Decrease */}
        <button
          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleDecrease(data._id, data.quantity)}
        >
          <FaMinus size={12} />
        </button>

        <span className="px-2">{data.quantity}</span>

        {/* Increase */}
        <button
          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleIncrease(data._id, data.quantity)}
        >
          <FaPlus size={12} />
        </button>

        <button className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer" onClick={() => handleDeleteCartItem(data._id)}>
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartItemCard;
