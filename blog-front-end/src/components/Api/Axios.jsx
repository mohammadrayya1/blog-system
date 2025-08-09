import axios from "axios";
import { baseUrl } from "./Api";
import Cookie from "cookie-universal";

const cookie = Cookie();
const tokenUser = cookie.get("user-token");

export const AxiosUser = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${tokenUser}`,
  },
});
