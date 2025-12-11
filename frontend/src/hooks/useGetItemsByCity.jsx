import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice.js";

function useGetItemsByCity() {
  const { currentCity } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!currentCity) return;
    const fetchItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-items-by-city/${currentCity}`,
          { withCredentials: true }
        );
        dispatch(setItemsInMyCity(result.data));
        console.log("useGetItemsByCity", result.data);
      } catch (error) {
        console.log("Error", error);
      }
    };
    fetchItems();
  }, [currentCity, dispatch]);
}

export default useGetItemsByCity;
