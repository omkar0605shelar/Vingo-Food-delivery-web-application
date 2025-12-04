import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setCity, setState } from "../redux/userSlice.js";
import { setMapAddress, setLocation } from "../redux/mapSlice.js";

function useGetCity() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );

          const info = response?.data?.results[0];
          console.log("useGetCity", info);

          const city =
            info.city ||
            info.town ||
            info.village ||
            info.suburb ||
            info.locality ||
            "Unknown City";

          const state = info.state || "Unknown State";

          dispatch(
            setMapAddress(
              `${info?.address_line1 || ""}, ${info?.address_line2 || ""}`
            )
          );
          dispatch(setLocation({ lat: latitude, lon: longitude }));
          dispatch(setCity(city));
          dispatch(setState(state));

          dispatch(
            setAddress(
              [info.address_line1, info.address_line2]
                .filter(Boolean)
                .join(", ")
            )
          );
        } catch (err) {
          console.log("Error fetching city via GPS:", err);
        }
      },

      (err) => {
        console.log("GeoLocation Error:", err);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [userData]);

  return null;
}

export default useGetCity;
