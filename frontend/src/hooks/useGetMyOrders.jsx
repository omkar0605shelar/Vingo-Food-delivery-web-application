import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { serverUrl } from "../App";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });

        console.log("useGetMyOrders", result?.data);

        dispatch(setMyOrders(result.data || []));
      } catch (error) {
        console.log("Order fetch error:", error);
        dispatch(setMyOrders([]));
      }
    };

    fetchOrders();
  }, [dispatch, userData]);

  return null;
}

export default useGetMyOrders;
