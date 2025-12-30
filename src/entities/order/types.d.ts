import { Sku } from "../sku/types";

export type UseOrderProps = {
  branches: Branch[];
  inventoryList: Record<string, Inventory[]>;
  orderList: Record<string, Order[]>;
  transferList: Record<string, StockTransfer[]>;
  currentBranchId: string;
  complaintList: Record<string, Complaint[]>;
  driverList: Record<string, Driver[]>;
  fetchBranchList: () => void;
  fetchOrderList: () => void;
  fetchTransferList: () => void;
  fetchInventoryList: () => void;
  setcurrentBranchId: (id: string) => void;
  fetchComplaintList: () => void;
  fetchDriverList: () => void;
};
export interface Branch {
  id: string;
  name: string;
  location: string;
  type: BranchType;
}
export interface Order {
  id: string;
  branchId: string;
  sku: Sku;
  quantity: number;
  status: OrderStatus;
  orderDate: string;
  driver?: Driver; // Assigned driver
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
  fromBranch: Branch;
  toBranch: Branch;
  sku: Sku;
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
  id: string;
  sku: Sku;
  branchId: string;
  quantity: number;
  lastUpdated: string;
  imageUrl: string;
  status: string;
  sku: Sku;
}
