
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CarInfo {
  model: string;
  color: string;
  plate: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  picked: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  car: CarInfo;
  totalPrice: number;
  timestamp: string;
  etaMinutes?: number;
}

export enum AuthStep {
  LOGIN,
  OTP,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  DASHBOARD
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  branchId: string;
  branchName: string;
}

export interface CustomerPurchase {
  id: string;
  date: string;
  amount: number;
  itemsCount: number;
  status: OrderStatus;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  purchases: CustomerPurchase[];
}

export interface BranchFeedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  timestamp: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL';
  suggestedAction?: string;
}

export interface SystemAlert {
  id: string;
  type: 'STOCK' | 'CAPACITY' | 'STAFF';
  message: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  time: string;
}
