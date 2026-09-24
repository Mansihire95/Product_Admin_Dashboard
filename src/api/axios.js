import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';
//I created a shared Axios instance so that common configuration like the base URL, headers,
// // authentication token, and centralized error handling can be
// // maintained in one place instead of repeating them in every API call."

const axiosInstance = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});
//Axios interceptor It's a feature provided by the Axios library itself.
//An Axios interceptor allows us to execute some logic before a request is sent or after a response is received. In my project,
// // I use a request interceptor to automatically attach the authentication token to every API request."
// Attach token to every request if it exists


/*And Axios already provides:
axios.interceptors.request
axios.interceptors.response
 */

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cancelled requests should be silently ignored
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // Convert Axios errors into readable messages
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
/*
Without interceptor, you might have to write this every time:

axios.get('/products', {
   headers: {
      Authorization: `Bearer ${token}`
   }
});

That's repetitive.

With interceptor, you write:

axiosInstance.get('/products');

and the token is automatically attached.*/ 