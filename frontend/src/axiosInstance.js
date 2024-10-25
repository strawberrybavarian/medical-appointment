// axiosInstance.js
import axios from 'axios';
import { ip } from './ContentExport'; // Adjust the path based on your project structure

const axiosInstance = axios.create({
  baseURL: `${ip.address}`,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage or sessionStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
