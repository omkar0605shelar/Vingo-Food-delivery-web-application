import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
  const { currentCity } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          { withCredentials: true }
        );
        dispatch(setShopInMyCity(result.data));
        console.log("useGetShopByCity", result.data);
      } catch (error) {
        console.log("useGetShopByCity Error", error);
      }
    };
    fetchShops();
  }, [currentCity]);
}

export default useGetShopByCity;
