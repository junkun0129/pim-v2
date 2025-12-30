import { useDataContext } from "@/src/components/providers/dataProvider";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";
import Select from "@/src/components/ui/Select";
import { ICONS } from "@/src/constants";
import React, { useEffect, useState } from "react";

const LogisticsTab = () => {
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const { driverList, fetchDriverList, currentBranchId } = useDataContext();

  useEffect(() => {
    fetchDriverList();
  }, [currentBranchId]);

  const handleSubmitDriver = () => {
    if (newDriverName && newDriverPhone) {
      // onRegisterDriver({
      //   name: newDriverName,
      //   phone: newDriverPhone,
      //   status: "AVAILABLE",
      //   currentLocation: "待機中",
      // });
      setIsDriverModalOpen(false);
      setNewDriverName("");
      setNewDriverPhone("");
    }
  };

  const displayList = driverList[currentBranchId] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
          登録ドライバー一覧
        </h3>
        <Button onClick={() => setIsDriverModalOpen(true)}>
          {ICONS.plus} ドライバー登録
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((driver) => (
          <Card key={driver.id} className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                {driver.name}
              </h4>
              <p className="text-sm text-slate-500">{driver.phone}</p>
              <p className="text-xs text-slate-400 mt-1">
                現在地: {driver.currentLocation}
              </p>
            </div>
            <Badge
              color={
                driver.status === "AVAILABLE"
                  ? "green"
                  : driver.status === "BUSY"
                  ? "red"
                  : "gray"
              }
            >
              {driver.status}
            </Badge>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        title="新規ドライバー登録"
      >
        <div className="space-y-4">
          <Input
            label="氏名/会社名"
            value={newDriverName}
            onChange={(e) => setNewDriverName(e.target.value)}
          />
          <Input
            label="連絡先 (電話番号)"
            value={newDriverPhone}
            onChange={(e) => setNewDriverPhone(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDriverModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmitDriver}>登録</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LogisticsTab;
