// AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookie from "universal-cookie";
import { AxiosUser } from "./Api/Axios";

const cookies = new Cookie();
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = cookies.get("auth:token");
    const savedUser = cookies.get("auth:user");
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      cookies.set("auth:token", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
        secure: true,
      });
    } else {
      delete axios.defaults.headers.common.Authorization;
      cookies.remove("auth:token", { path: "/" });
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await AxiosUser.post("/api/account/login", {
      email,
      password,
    });
    console.log(data);
    setToken(data.token);
    setUser(data.user || null);
    if (data.user) {
      cookies.set("auth:user", JSON.stringify(data.user), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "Lax",
        secure: true,
      });
      console.log(data);
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
      login,
      logout,
    }),
    [token, user]
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
