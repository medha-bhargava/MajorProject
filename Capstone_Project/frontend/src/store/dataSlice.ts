import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { InventoryItem, NotificationItem, PurchaseOrder, Shipment, Supplier } from '../types';

interface DataState { inventory: InventoryItem[]; suppliers: Supplier[]; orders: PurchaseOrder[]; shipments: Shipment[]; notifications: NotificationItem[]; loading: boolean; }
const initialState: DataState = { inventory: [], suppliers: [], orders: [], shipments: [], notifications: [], loading: false };

export const loadDashboardData = createAsyncThunk('data/loadDashboardData', async () => {
  const [inventory, suppliers, orders, shipments, notifications] = await Promise.all([
    api.get('/inventory', { params: { size: 20 } }), api.get('/suppliers'), api.get('/orders'), api.get('/shipments'), api.get('/notifications')
  ]);
  return { inventory: inventory.data.content || [], suppliers: suppliers.data, orders: orders.data, shipments: shipments.data, notifications: notifications.data };
});

const dataSlice = createSlice({
  name: 'data', initialState, reducers: {},
  extraReducers: builder => {
    builder.addCase(loadDashboardData.pending, state => { state.loading = true; });
    builder.addCase(loadDashboardData.fulfilled, (state, action) => { Object.assign(state, action.payload); state.loading = false; });
    builder.addCase(loadDashboardData.rejected, state => { state.loading = false; });
  }
});
export default dataSlice.reducer;

