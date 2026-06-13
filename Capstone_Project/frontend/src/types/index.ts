export type Role = 'ADMIN' | 'WAREHOUSE_MANAGER' | 'PROCUREMENT_MANAGER' | 'SUPPLIER';
export interface AuthUser { userId: string; fullName: string; email: string; role: Role; accessToken: string; refreshToken: string; }
export interface InventoryItem { id: string; sku: string; name: string; category: string; warehouseCode: string; quantity: number; lowStockThreshold: number; unitCost: number; valuation: number; lowStock: boolean; updatedAt: string; }
export interface Supplier { id: string; name: string; email: string; phone: string; contactPerson: string; productCategory: string; averageLeadTimeDays: number; rating: number; }
export interface PurchaseOrder { id: string; sku: string; itemName: string; quantity: number; supplierId: string; requestedBy: string; status: string; unitCost: number; }
export interface Shipment { id: string; trackingNumber: string; carrier: string; originWarehouse: string; destinationWarehouse: string; sku?: string; quantity?: number; orderId?: string; status: string; }
export interface NotificationItem { id: string; type: string; title: string; message: string; read_at?: string; created_at: string; }
