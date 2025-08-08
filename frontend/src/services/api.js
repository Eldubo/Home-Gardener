import axios from "axios";

export const createAPI = (baseURL, { timeout = 8000 } = {}) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
  });
  return instance;
};
