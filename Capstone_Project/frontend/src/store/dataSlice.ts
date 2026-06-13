import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type {
  InventoryItem,
  NotificationItem,
  PurchaseOrder,
  Shipment,
  Supplier,
} from '../types';

interface DataState {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  shipments: Shipment[];
  notifications: NotificationItem[];
  loading: boolean;
  error?: string;
}

const initialState: DataState = {
  inventory: [],
  suppliers: [],
  orders: [],
  shipments: [],
  notifications: [],
  loading: false,
  error: undefined,
};

export const loadDashboardData = createAsyncThunk(
  'data/loadDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const [
        inventory,
        suppliers,
        orders,
        shipments,
        notifications,
      ] = await Promise.all([
        api.get('/inventory', { params: { size: 20 } }),
        api.get('/suppliers'),
        api.get('/orders'),
        api.get('/shipments'),
        api.get('/notifications'),
      ]);

      return {
        inventory: inventory.data?.content || inventory.data || [],
        suppliers: suppliers.data?.content || suppliers.data || [],
        orders: orders.data?.content || orders.data || [],
        shipments: shipments.data?.content || shipments.data || [],
        notifications: notifications.data?.content || notifications.data || [],
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load dashboard data'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { data: DataState };
      return !state.data.loading;
    },
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadDashboardData.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });

    builder.addCase(loadDashboardData.fulfilled, (state, action) => {
      state.inventory = action.payload.inventory;
      state.suppliers = action.payload.suppliers;
      state.orders = action.payload.orders;
      state.shipments = action.payload.shipments;
      state.notifications = action.payload.notifications;
      state.loading = false;
    });

    builder.addCase(loadDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default dataSlice.reducer;


// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { api } from '../api/client';
// import type { InventoryItem, NotificationItem, PurchaseOrder, Shipment, Supplier } from '../types';

// interface DataState { inventory: InventoryItem[]; suppliers: Supplier[]; orders: PurchaseOrder[]; shipments: Shipment[]; notifications: NotificationItem[]; loading: boolean; }
// const initialState: DataState = { inventory: [], suppliers: [], orders: [], shipments: [], notifications: [], loading: false };

// export const loadDashboardData = createAsyncThunk('data/loadDashboardData', async () => {
//   const [inventory, suppliers, orders, shipments, notifications] = await Promise.all([
//     api.get('/inventory', { params: { size: 20 } }), api.get('/suppliers'), api.get('/orders'), api.get('/shipments'), api.get('/notifications')
//   ]);
//   return { inventory: inventory.data.content || [], suppliers: suppliers.data, orders: orders.data, shipments: shipments.data, notifications: notifications.data };
// });

// const dataSlice = createSlice({
//   name: 'data', initialState, reducers: {},
//   extraReducers: builder => {
//     builder.addCase(loadDashboardData.pending, state => { state.loading = true; });
//     builder.addCase(loadDashboardData.fulfilled, (state, action) => { Object.assign(state, action.payload); state.loading = false; });
//     builder.addCase(loadDashboardData.rejected, state => { state.loading = false; });
//   }
// });
// export default dataSlice.reducer;




// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { api } from '../api/client';
// import type {
//   InventoryItem,
//   NotificationItem,
//   PurchaseOrder,
//   Shipment,
//   Supplier,
// } from '../types';

// interface DataState {
//   inventory: InventoryItem[];
//   suppliers: Supplier[];
//   orders: PurchaseOrder[];
//   shipments: Shipment[];
//   notifications: NotificationItem[];
//   loading: boolean;
//   error?: string;
// }

// const initialState: DataState = {
//   inventory: [],
//   suppliers: [],
//   orders: [],
//   shipments: [],
//   notifications: [],
//   loading: false,
// };

// export const loadDashboardData = createAsyncThunk(
//   'data/loadDashboardData',
//   async (_, { rejectWithValue }) => {
//     try {
//       const [inventory, suppliers, orders, shipments, notifications] =
//         await Promise.all([
//           api.get('/inventory', { params: { size: 20 } }),
//           api.get('/suppliers'),
//           api.get('/orders'),
//           api.get('/shipments'),
//           api.get('/notifications'),
//         ]);

//       return {
//         inventory: inventory.data?.content || inventory.data || [],
//         suppliers: suppliers.data?.content || suppliers.data || [],
//         orders: orders.data?.content || orders.data || [],
//         shipments: shipments.data?.content || shipments.data || [],
//         notifications: notifications.data?.content || notifications.data || [],
//       };
//     } catch (err: any) {
//       return rejectWithValue(
//         err.response?.data?.message ||
//           err.response?.data ||
//           'Failed to load dashboard data'
//       );
//     }
//   }
// );

// const dataSlice = createSlice({
//   name: 'data',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(loadDashboardData.pending, (state) => {
//       state.loading = true;
//       state.error = undefined;
//     });

//     builder.addCase(loadDashboardData.fulfilled, (state, action) => {
//       state.inventory = action.payload.inventory;
//       state.suppliers = action.payload.suppliers;
//       state.orders = action.payload.orders;
//       state.shipments = action.payload.shipments;
//       state.notifications = action.payload.notifications;
//       state.loading = false;
//     });

//     builder.addCase(loadDashboardData.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload as string;
//     });
//   },
// });

// export default dataSlice.reducer;