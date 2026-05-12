import axios from 'axios';
import type { AuthUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

api.interceptors.request.use(config => {
  const raw = localStorage.getItem('smartInventoryAuth');
  if (raw) {
    const user = JSON.parse(raw) as AuthUser;
    config.headers.Authorization = 'Bearer ' + user.accessToken;
  }
  return config;
});

