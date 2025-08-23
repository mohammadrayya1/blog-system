// AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookie from "universal-cookie";
import { AxiosUser } from "./Api/Axios";

const cookies = new Cookie();
const AuthContext = createContext(undefined);

// detect if running under https
const isSecure = window.location.protocol === "https:";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 جديد

  // استرجاع من الكوكي عند أول تحميل
  useEffect(() => {
    const savedToken = cookies.get("auth:token");
    const savedUser = cookies.get("auth:user");

    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        const parsedUser =
            typeof savedUser === "string"
                ? JSON.parse(decodeURIComponent(savedUser))
                : savedUser;

        console.log("parsedUser", parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from cookie:", e);
        setUser(null);
      }
    }

    setLoading(false); // 👈 خلصنا قراءة الكوكي
  }, []);

  // مراقبة التوكن وتحديث الكوكي
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      cookies.set("auth:token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
        secure: isSecure,
      });
    } else {
      delete axios.defaults.headers.common.Authorization;
      cookies.remove("auth:token", { path: "/" });
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await AxiosUser.post("/account/login", {
      email,
      password,
    });

    console.log("Data", data);
    setToken(data.token);
    setUser(data.user || null);

    if (data.user) {
      cookies.set("auth:user", JSON.stringify(data.user), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
        secure: isSecure,
      });
      console.log("Saved user", data.user);
    } else {
      cookies.remove("auth:user", { path: "/" });
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    cookies.remove("auth:user", { path: "/" });
  };

  const value = useMemo(
      () => ({
        token,
        user,
        isAuthenticated: !!token,
        loading, // 👈 نضيفها للـ context
        login,
        logout,
      }),
      [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
