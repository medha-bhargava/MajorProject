// import axios from 'axios';
// import type { AuthUser } from '../types';

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 15000,
// });

// const authClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 15000,
// });

// api.interceptors.request.use((config) => {
//   const raw = localStorage.getItem('smartInventoryAuth');

//   if (raw) {
//     const user = JSON.parse(raw) as AuthUser;

//     if (user.accessToken) {
//       config.headers.Authorization = `Bearer ${user.accessToken}`;
//     }
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const raw = localStorage.getItem('smartInventoryAuth');

//       if (!raw) {
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       const user = JSON.parse(raw) as AuthUser;

//       if (!user.refreshToken) {
//         localStorage.removeItem('smartInventoryAuth');
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       try {
//         const { data } = await authClient.post<AuthUser>('/auth/refresh', {
//           refreshToken: user.refreshToken,
//         });

//         localStorage.setItem('smartInventoryAuth', JSON.stringify(data));

//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

//         return api(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem('smartInventoryAuth');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

import axios from 'axios';
import type { AuthUser } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('smartInventoryAuth');

  if (raw) {
    const user = JSON.parse(raw) as AuthUser;

    const token =
      user.accessToken ||
      (user as any).token ||
      (user as any).jwt;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});