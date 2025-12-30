import { useState } from "react";
import { api } from "../api";
import {
  Branch,
  Complaint,
  Driver,
  Inventory,
  Order,
  StockTransfer,
} from "./types";

export const useOrder = () => {
  const [branches, setbranches] = useState<Branch[]>([]);
  const [currentBranchId, setcurrentBranchId] = useState<string>("");

  const [inventoryList, setinventoryList] = useState<
    Record<string, Inventory[]>
  >({});
  const [transferList, settransferList] = useState<
    Record<string, StockTransfer[]>
  >({});
  const [orderList, setorderList] = useState<Record<string, Order[]>>({});
  const [complaintList, setcomplaintList] = useState<
    Record<string, Complaint[]>
  >({});
  const [driverList, setdriverList] = useState<Record<string, Driver[]>>({});

  const fetchBranchList = async () => {
    const rawList = await api.getBranchList();
    setbranches(rawList);
  };

  const fetchOrderList = async () => {
    const rawList = await api.getOrderList(currentBranchId);
    setorderList((pre) => ({ ...pre, [currentBranchId]: rawList }));
  };
  const fetchTransferList = async () => {
    const rawList = await api.getTransferList(currentBranchId);
    settransferList((pre) => ({ ...pre, [currentBranchId]: rawList }));
  };
  const fetchInventoryList = async () => {
    const rawList = await api.getInventory(currentBranchId);
    setinventoryList((pre) => ({ ...pre, [currentBranchId]: rawList }));
  };
  const fetchComplaintList = async () => {
    const rawList = await api.getComplaintList(currentBranchId);
    setcomplaintList((pre) => ({ ...pre, [currentBranchId]: rawList }));
  };
  const fetchDriverList = async () => {
    const rawList = await api.getDriverList(currentBranchId);
    setdriverList((pre) => ({ ...pre, [currentBranchId]: rawList }));
  };

  return {
    branches,
    inventoryList,
    orderList,
    transferList,
    complaintList,
    driverList,
    currentBranchId,
    fetchBranchList,
    fetchOrderList,
    fetchTransferList,
    fetchInventoryList,
    setcurrentBranchId,
    fetchComplaintList,
    fetchDriverList,
  };
};
