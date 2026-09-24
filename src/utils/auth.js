const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

//setAuth stores our toekn and user data in local storage. This is typically done after a successful login to persist the user's session across page reloads.
export const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // we have used stringify to convert the user object into a JSON string before storing it in local storage, as local storage can only store strings.
};

//clearAuth is for logout functionality. It removes the token and user data from local storage, effectively
// // logging the user out of the application.
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());
