
import React from 'react';
import { 
  ShoppingBag, 
  Package, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users as UsersIcon
} from 'lucide-react';
import { OrderStatus } from './types';

export const COLORS = {
  charcoal: '#121212',
  slate: '#1e293b',
  emerald: '#059669',
  error: '#f43f5e',
  warning: '#f59e0b',
};

export const NAVIGATION = [
  { name: 'Live Orders', icon: <ShoppingBag size={20} />, id: 'orders' },
  { name: 'Inventory', icon: <Package size={20} />, id: 'inventory' },
  { name: 'Performance', icon: <BarChart3 size={20} />, id: 'analytics' },
  { name: 'Feedback', icon: <MessageSquare size={20} />, id: 'feedback' },
  { name: 'Users', icon: <UsersIcon size={20} />, id: 'users' },
  { name: 'Settings', icon: <Settings size={20} />, id: 'settings' },
];

export const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [OrderStatus.PENDING]: { label: 'Pending', color: 'text-slate-400', icon: <Clock size={16} /> },
  [OrderStatus.PREPARING]: { label: 'Preparing', color: 'text-emerald-400', icon: <ShoppingBag size={16} /> },
  [OrderStatus.READY]: { label: 'Ready', color: 'text-blue-400', icon: <Package size={16} /> },
  [OrderStatus.ARRIVED]: { label: 'Customer Arrived', color: 'text-orange-400', icon: <AlertCircle size={16} /> },
  [OrderStatus.COMPLETED]: { label: 'Completed', color: 'text-emerald-500', icon: <CheckCircle2 size={16} /> },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'text-rose-400', icon: <AlertCircle size={16} /> },
};
