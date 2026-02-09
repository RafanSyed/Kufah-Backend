// src/utils/attendance/internalApi.ts
import axios, { AxiosInstance } from "axios";

const apiService: AxiosInstance = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export const ApiService = {
  async get(endpoint: string, params: Record<string, any> = {}) {
    const response = await apiService.get(endpoint, { params });
    return response.data;
  },
  async post(endpoint: string, data: Record<string, any> = {}) {
    const response = await apiService.post(endpoint, data);
    return response.data;
  },
  async put(endpoint: string, data: Record<string, any> = {}, config: Record<string, any> = {}) {
    const response = await apiService.put(endpoint, data, config);
    return response.data;
  },
};
