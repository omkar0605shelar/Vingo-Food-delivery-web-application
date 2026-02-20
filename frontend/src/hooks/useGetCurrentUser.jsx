import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setAuthChecked, setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true }
        );

        // If success → set user
        dispatch(setUserData(result.data));
      } catch (error) {
        // If failed → CLEAR user
        dispatch(setUserData(null));
      } finally {
        // Mark auth check completed
        dispatch(setAuthChecked(true));
      }
    };

    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;