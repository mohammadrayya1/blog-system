import axios from "axios";
import { baseUrl } from "./Api";
import Cookie from "universal-cookie";

const cookies = new Cookie(); // ✅ لازم new
const tokenUser = cookies.get("user-token");

export const AxiosUser = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: tokenUser ? `Bearer ${tokenUser}` : "",
  },
});
