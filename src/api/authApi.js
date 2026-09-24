import axiosInstance from './axios';

/**
 * The API request is asynchronous because we don't know how long the server will take to respond. await pauses execution 
 * of this function until the API response is received, without blocking the browser.
 */
export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
    expiresInMins: 60,
    //expiresInMins: 60 asks DummyJSON to issue the authentication token with a 60-minute expiration.
  });
  return response.data;
};
