import axios, { type AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
  timeout: 10000000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // handle global errors here (e.g., 401 -> logout)
    return Promise.reject(error);
  }
);

export async function getJson<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function postJson<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.post<T>(url, body, config);
  return data;
}
