import axios from "axios";
import Cookie from "universal-cookie";

const cookies = new Cookie();


export const AxiosUser = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false,
});


export const AxiosAuth = axios.create({
  baseURL: "http://localhost:8080/api",
});

AxiosAuth.interceptors.request.use((config) => {
  const tokenUser = cookies.get("auth:token");
  if (tokenUser) {
    config.headers.Authorization = `Bearer ${tokenUser}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});
