import { useDataContext } from "@/src/components/providers/dataProvider";
import { ICONS } from "@/src/constants";
import React, { useState, useMemo, useEffect } from "react";
import InventoryTab from "./components/InventoryTab";
import OrdersTab from "./components/OrdersTab";
import MessagesTab from "./components/MessagesTab";
import LogisticsTab from "./components/LogisticsTab";
import TransferTab from "./components/TransferTab";

export default function OrderPage() {
  const [activeTab, setActiveTab] = useState<
    "INVENTORY" | "HISTORY" | "MESSAGES" | "LOGISTICS" | "TRANSFER"
  >("INVENTORY");

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const { branches, fetchBranchList, setcurrentBranchId, currentBranchId } =
    useDataContext();

  useEffect(() => {
    fetchBranchList();
  }, []);

  const currentBranch = branches[0];

  return (
    <div className="space-y-6">
      {/* Header / Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {ICONS.shop}
            店舗在庫・発注管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            現在、
            <span className="font-bold text-sky-600">
              {currentBranch?.name}
            </span>{" "}
            ({currentBranch?.location}) として操作中
          </p>
        </div>

        {/* Custom Dropdown Branch Selector */}
        <div className="relative z-20">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all group"
          >
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wide">
              店舗切替
            </span>
            <span className="h-4 w-px bg-slate-300 dark:bg-slate-600"></span>
            <span className="font-bold text-slate-700 dark:text-white">
              {currentBranch?.name}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-400 transition-transform duration-200 ${
                isBranchDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isBranchDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsBranchDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    利用可能な店舗一覧
                  </p>
                </div>
                <ul className="max-h-80 overflow-y-auto py-2">
                  {branches.map((branch) => (
                    <li key={branch.id}>
                      <button
                        onClick={() => {
                          setcurrentBranchId(branch.id);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 flex items-start gap-4 transition-all duration-200 border-l-4 ${
                          currentBranchId === branch.id
                            ? "bg-sky-50 dark:bg-sky-900/20 border-sky-500"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-2 rounded-lg ${
                            currentBranchId === branch.id
                              ? "bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-200"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                          }`}
                        >
                          {ICONS.shop}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-bold ${
                                currentBranchId === branch.id
                                  ? "text-sky-700 dark:text-sky-400"
                                  : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {branch.name}
                            </p>
                            {currentBranchId === branch.id && (
                              <span className="text-sky-600 dark:text-sky-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {branch.location}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === "INVENTORY"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setActiveTab("INVENTORY")}
        >
          在庫一覧
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === "HISTORY"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setActiveTab("HISTORY")}
        >
          発注履歴
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === "MESSAGES"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setActiveTab("MESSAGES")}
        >
          メッセージ/報告
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === "LOGISTICS"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setActiveTab("LOGISTICS")}
        >
          配送/ドライバー
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === "TRANSFER"
              ? "border-sky-600 text-sky-600 dark:text-sky-400"
              : "border-transparent text-slate-500"
          }`}
          onClick={() => setActiveTab("TRANSFER")}
        >
          店舗間移動
        </button>
      </div>

      {/* Content */}
      {activeTab === "INVENTORY" && <InventoryTab />}
      {activeTab === "HISTORY" && <OrdersTab />}
      {activeTab === "MESSAGES" && <MessagesTab />}
      {activeTab === "LOGISTICS" && <LogisticsTab />}
      {activeTab === "TRANSFER" && <TransferTab />}
    </div>
  );
}
