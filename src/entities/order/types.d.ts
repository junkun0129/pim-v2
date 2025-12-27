export interface Branch {
  id: string;
  name: string;
  location: string;
  type: BranchType;
}
export interface Order {
  id: string;
  branchId: string;
  skuId: string;
  quantity: number;
  status: OrderStatus;
  orderDate: string;
  driverId?: string; // Assigned driver
}
export interface CustomerOrder {
  id: string;
  customerName: string;
  skuId: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
}
export interface Complaint {
  id: string;
  branchId: string;
  title: string;
  content: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  response?: string;
}
export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
  currentLocation?: string;
}
export interface StockTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  skuId: string;
  quantity: number;
  status: "REQUESTED" | "SHIPPED" | "COMPLETED";
  date: string;
}
export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "SHIPPED"
  | "RECEIVED"
  | "CANCELLED";

export type BranchType = "RETAIL" | "EC";

export interface Inventory {
  skuId: string;
  branchId: string;
  quantity: number;
  lastUpdated: string;
}
