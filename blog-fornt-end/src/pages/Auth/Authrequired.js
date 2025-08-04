import axios from "axios";
import Cookie from "cookie-universal";
import { useEffect, useState } from "react";
import { Outlet, Navigate, useParams, useNavigate } from "react-router-dom";
import { baseUrl } from "../../Api/Api";
import { AdminAuth } from "../../Api/Api";
import LoadingSubmit from "../../components/loading/Loading";

export default function Authrequired() {
  const [userExict, setUser] = useState("");
  const cookie = Cookie();
  const token = cookie.get("admin-token");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        var response = await axios.post(
          `${baseUrl}/${AdminAuth}`,
          JSON.stringify(token),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          setUser(response.data.email);
        } else if (response.status === 401) {
          navigate("/loginAdmin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        navigate("/loginAdmin", { replace: true });
      }
    };

    fetchData();
  }, []);

  return token ? (
    userExict === "" ? (
      <LoadingSubmit />
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to={"/loginAdmin"} replace={true} />
  );
}
