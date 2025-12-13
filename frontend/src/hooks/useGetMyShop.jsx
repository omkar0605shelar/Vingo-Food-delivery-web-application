import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData || userData.role !== "owner") return;
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my-shop`, {
          withCredentials: true,
        });

        if (result.data) {
          console.log("useGetMyShop", result?.data);
          dispatch(setMyShopData(result.data));
        } else {
          dispatch(setMyShopData(null));
        }
      } catch (error) {
        console.log("useGetMyShop error", error);
        dispatch(setMyShopData(null));
      }
    };

    fetchShop();
  }, [dispatch, userData]);

  return null;
}

export default useGetMyShop;
