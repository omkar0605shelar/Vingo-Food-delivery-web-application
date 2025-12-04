import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { updateShopItems } from "../redux/ownerSlice";

function OwnerItemCard({ data }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDeleteItem = async () => {
    setLoading(true);
    try {
      const result = await axios.delete(
        `${serverUrl}/api/item/delete-item/${data._id}`,
        { withCredentials: true }
      );

      alert(`${data.name} deleted successfully`);

      dispatch(setMyShopData(result.data.shop));
      dispatch(updateShopItems(result.data.items));
    } catch (error) {
      console.log("Error while delete item ");
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      <div className="w-36 h-36 bg-gray-50 flex-shrink-0">
        <img
          src={data?.image}
          alt={data?.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between p-3 flex-1">
        <div className="">
          <h2 className="text-base font-semibold text-[#ff4d2d]">
            {data?.name}
          </h2>
          <p>
            <span className="font-medium text-gray-70">Category : </span>{" "}
            {data?.category}
          </p>
          <p>
            <span className="font-medium text-gray-70">Food Type : </span>
            {data?.foodType}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[#ff4d2d] font-bold">{data?.price}</div>
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              onClick={() => {
                navigate(`/edit-item/${data?._id}`);
              }}
            >
              <FaPen size={16} />
            </div>
            <div
              className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              disabled={loading}
              onClick={handleDeleteItem}
            >
              {loading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                <FaTrashAlt size={16} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
