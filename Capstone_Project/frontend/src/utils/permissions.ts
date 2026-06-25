import type { Role } from '../types';

type ModuleKey = 'dashboard' | 'inventory' | 'suppliers' | 'orders' | 'shipments' | 'sales' | 'analytics' | 'notifications' | 'profile';

const roleAccess: Record<string, ModuleKey[]> = {
  ADMIN: ['dashboard', 'inventory', 'suppliers', 'orders', 'shipments', 'sales', 'analytics', 'notifications', 'profile'],
  WAREHOUSE: ['dashboard', 'inventory', 'analytics', 'notifications', 'profile'],
  WAREHOUSE_MANAGER: ['dashboard', 'inventory', 'analytics', 'notifications', 'profile'],
  PROCUREMENT: ['dashboard', 'orders', 'analytics', 'notifications', 'profile'],
  PROCUREMENT_MANAGER: ['dashboard', 'orders', 'analytics', 'notifications', 'profile'],
  SUPPLIER: ['dashboard', 'suppliers', 'analytics', 'notifications', 'profile'],
  SUPPLIER_MANAGER: ['dashboard', 'suppliers', 'analytics', 'notifications', 'profile']
};

export function canAccess(role: Role | string | undefined, module: ModuleKey) {
  return role ? (roleAccess[role] || []).includes(module) : false;
}

export function permissionMessage(moduleLabel: string, role?: string) {
  return role === 'ADMIN'
    ? `This module is available to Admin users.`
    : `You do not have permission to access ${moduleLabel}.`;
}
