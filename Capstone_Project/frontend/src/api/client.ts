import axios from 'axios';
import type { AuthUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
// const authClient = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// let isRefreshing = false;
// let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

// const processQueue = (error: unknown, token?: string) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else if (token) {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

api.interceptors.request.use(config => {
  const raw = localStorage.getItem('smartInventoryAuth');
  if (raw) {
    const user = JSON.parse(raw) as AuthUser;
    config.headers.Authorization = 'Bearer ' + user.accessToken;
  }
  return config;
});

// api.interceptors.response.use(
//   response => response,
//   error => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = 'Bearer ' + token;
//           return api(originalRequest);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const raw = localStorage.getItem('smartInventoryAuth');
//       if (!raw) {
//         isRefreshing = false;
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       const user = JSON.parse(raw) as AuthUser;
//       return authClient.post<AuthUser>('/auth/refresh', { refreshToken: user.refreshToken })
//         .then(({ data }) => {
//           localStorage.setItem('smartInventoryAuth', JSON.stringify(data));
//           originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
//           processQueue(null, data.accessToken);
//           return api(originalRequest);
//         })
//         .catch(err => {
//           processQueue(err, undefined);
//           localStorage.removeItem('smartInventoryAuth');
//           window.location.href = '/login';
//           return Promise.reject(err);
//         })
//         .finally(() => {
//           isRefreshing = false;
//         });
//     }
//     return Promise.reject(error);
//   }
// );

