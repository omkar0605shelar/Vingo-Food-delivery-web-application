import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { serverUrl } from "../App";

const useGetMyOrders = (userData) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userData) return;

    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true, // 🔥 MUST for cookie-based auth
        });

        dispatch(setMyOrders(res.data || []));
      } catch (error) {
        console.error("useGetMyOrders error:", error);
        dispatch(setMyOrders([]));
      }
    };

    fetchMyOrders();
  }, [dispatch, userData]);

  return null;
};

export default useGetMyOrders;
