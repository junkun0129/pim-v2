import { useDataContext } from "@/src/components/providers/dataProvider";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import Modal from "@/src/components/ui/Modal";
import Select from "@/src/components/ui/Select";
import { ICONS } from "@/src/constants";
import React, { useEffect, useState } from "react";

const OrdersTab = () => {
  const {
    orderList,
    fetchOrderList,
    currentBranchId,
    driverList,
    fetchDriverList,
  } = useDataContext();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  useEffect(() => {
    fetchOrderList();
    fetchDriverList();
  }, [currentBranchId]);

  const handleAssignDriverSubmit = () => {
    if (selectedOrderId && selectedDriverId) {
      // onAssignDriver(selectedOrderId, selectedDriverId);
      setIsAssignModalOpen(false);
      setSelectedOrderId(null);
      setSelectedDriverId("");
    }
  };
  const displayList = orderList[currentBranchId] ?? [];
  const drivers = driverList[currentBranchId] ?? [];

  return (
    <div className="space-y-4">
      {displayList.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          発注履歴がありません。
        </div>
      ) : (
        displayList.map((order) => {
          const statusColor = {
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-blue-100 text-blue-800",
            SHIPPED: "bg-purple-100 text-purple-800",
            RECEIVED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
          }[order.status];

          const statusLabel = {
            PENDING: "承認待ち",
            APPROVED: "承認済み",
            SHIPPED: "配送中",
            RECEIVED: "受取完了",
            CANCELLED: "キャンセル",
          }[order.status];

          return (
            <Card
              key={order.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${statusColor}`}>
                  {ICONS.truck}
                </div>
                <div>
                  <p className="text-sm text-slate-500">{order.orderDate}</p>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                    {order.sku.name || "不明なSKU"}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    注文数: <span className="font-bold">{order.quantity}</span>{" "}
                    個
                    {order.driver && (
                      <span className="ml-2 text-zinc-500">
                        (担当: {order.driver.name})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}
                >
                  {statusLabel}
                </span>
                {order.status === "APPROVED" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    ドライバー手配
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="ドライバー手配"
      >
        <div className="space-y-4">
          <Select
            label="担当ドライバーを選択"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
          >
            <option value="">選択してください</option>
            {drivers
              .filter((d) => d.status === "AVAILABLE")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.currentLocation})
                </option>
              ))}
          </Select>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAssignModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleAssignDriverSubmit}>手配確定</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersTab;
