import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { AuthUser, Role } from '../types';

interface AuthState { user: AuthUser | null; loading: boolean; error?: string; }
const cached = localStorage.getItem('smartInventoryAuth');
const initialState: AuthState = { user: cached ? JSON.parse(cached) : null, loading: false };

export const login = createAsyncThunk('auth/login', async (payload: { email: string; password: string }) => {
  const { data } = await api.post<AuthUser>('/auth/login', payload);
  localStorage.setItem('smartInventoryAuth', JSON.stringify(data));
  return data;
});

export const register = createAsyncThunk('auth/register', async (payload: { fullName: string; email: string; password: string; role: Role }) => {
  const { data } = await api.post<AuthUser>('/auth/register', payload);
  localStorage.setItem('smartInventoryAuth', JSON.stringify(data));
  return data;
});

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: { logout(state) { state.user = null; localStorage.removeItem('smartInventoryAuth'); } },
  extraReducers: builder => {
    builder.addCase(login.pending, state => { state.loading = true; state.error = undefined; });
    builder.addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
    builder.addCase(register.fulfilled, (state, action) => { state.user = action.payload; });
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;

