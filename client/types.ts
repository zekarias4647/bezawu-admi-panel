
export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  VERIFIED = 'VERIFIED',
  GIVEN = 'GIVEN'
}

export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  SHUTDOWN = 'SHUTDOWN'
}

export enum GridStatus {
  ONLINE = 'ONLINE',
  DARK = 'DARK',
  OMNI_DARK = 'OMNI_DARK'
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
  bundleItems?: { name: string; quantity: number; selected_addons?: any[] }[];
  giftItems?: { name: string; quantity: number; selected_addons?: any[] }[];
  isGift?: boolean;
  selected_addons?: any;
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
  arrivedAt?: string;
  handoverTimeSeconds?: number | null;
  isGift: boolean;
  paymentProofUrl?: string | null;
}

export enum AuthStep {
  LOGIN,
  OTP,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  DASHBOARD,
  GLOBAL_TERMINATION,
  OMNI_LOCKDOWN,
  BRANCH_OFFLINE
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  branchId: string;
  branchName: string;
  isBusy: boolean;
  branchStatus: string;
  vendorName: string;
  vendorStatus: string;
  vendorBranchCount: number;
  businessType: string;
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
  loyaltyPoints?: number;
  isVerified?: boolean;
  profilePicture?: string;
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

// New Bundle Types
export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price?: string | number;
  selected_addons?: any[];
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  items?: BundleItem[];
  discount: number;
  bundle_addons?: any[];
}

export interface Story {
  id: string;
  title: string;
  video_url: string;
  link: string;
  description: string;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  created_at: string;
}

export interface StoryComment {
  id: number;
  story_id: number;
  user_name: string;
  content: string;
  created_at: string;
  likes_count: number;
}

export interface Ad {
  id: string;
  type: 'image' | 'video';
  media_url: string;
  description: string;
  duration_hours: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  status_derived?: string;
}

export interface Runner {
  id: string;
  branch_id: string;
  vendor_id: string;
  full_name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  pro_image: string;
  last_active: string;
  created_at: string;
}

