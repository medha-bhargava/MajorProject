import type { Role } from '../types';

type ModuleKey = 'dashboard' | 'inventory' | 'suppliers' | 'orders' | 'shipments' | 'sales' | 'analytics' | 'notifications' | 'profile';

const roleAccess: Record<string, ModuleKey[]> = {
  ADMIN: ['dashboard', 'inventory', 'suppliers', 'orders', 'shipments', 'sales', 'analytics', 'notifications', 'profile'],
  WAREHOUSE: ['dashboard', 'inventory', 'shipments', 'sales', 'notifications', 'profile'],
  WAREHOUSE_MANAGER: ['dashboard', 'inventory', 'shipments', 'sales', 'notifications', 'profile'],
  PROCUREMENT: ['dashboard', 'orders', 'suppliers', 'notifications', 'profile'],
  PROCUREMENT_MANAGER: ['dashboard', 'orders', 'suppliers', 'notifications', 'profile'],
  SUPPLIER: ['dashboard', 'orders', 'shipments', 'notifications', 'profile']
};

export function canAccess(role: Role | string | undefined, module: ModuleKey) {
  return role ? (roleAccess[role] || []).includes(module) : false;
}

export function permissionMessage(moduleLabel: string, role?: string) {
  return role === 'ADMIN'
    ? `This module is available to Admin users.`
    : `You do not have permission to access ${moduleLabel}. Contact an Admin user if you need access.`;
}
