import { useDataContext } from "@/src/components/providers/dataProvider";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";
import Select from "@/src/components/ui/Select";
import { ICONS } from "@/src/constants";
import React, { useEffect, useState } from "react";

const TransferTab = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetBranch, setTransferTargetBranch] = useState("");
  const [transferSkuId, setTransferSkuId] = useState("");
  const [transferQty, setTransferQty] = useState(1);

  const {
    transferList,
    fetchTransferList,
    currentBranchId,
    branches,
    skuList,
  } = useDataContext();

  useEffect(() => {
    fetchTransferList();
  }, [currentBranchId]);

  const displayList = transferList[currentBranchId] ?? [];

  const handleTransferSubmit = () => {
    if (transferTargetBranch && transferSkuId && transferQty > 0) {
      //   onTransferStock({
      //     fromBranchId: currentBranchId,
      //     toBranchId: transferTargetBranch,
      //     skuId: transferSkuId,
      //     quantity: transferQty,
      //   });
      setIsTransferModalOpen(false);
    }
  };
  const currentBranch = branches.find((i) => i.id === currentBranchId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
          店舗間在庫移動
        </h3>
        <Button onClick={() => setIsTransferModalOpen(true)}>
          {ICONS.plus} 在庫移動指示
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
              <tr>
                <th className="px-6 py-3">日付</th>
                <th className="px-6 py-3">移動元</th>
                <th className="px-6 py-3">移動先</th>
                <th className="px-6 py-3">商品</th>
                <th className="px-6 py-3">数量</th>
                <th className="px-6 py-3">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {displayList.map((tr) => (
                <tr
                  key={tr.id}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{tr.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tr.fromBranch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tr.toBranch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{tr.sku.name}</td>
                  <td className="px-6 py-4 font-bold whitespace-nowrap">
                    {tr.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color="green">{tr.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="在庫移動指示"
      >
        <div className="space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded mb-2">
            <span className="text-xs text-slate-500">移動元:</span>
            <div className="font-bold">{currentBranch?.name ?? "不明"}</div>
          </div>

          <Select
            label="移動先店舗"
            value={transferTargetBranch}
            onChange={(e) => setTransferTargetBranch(e.target.value)}
          >
            <option value="">選択してください</option>
            {branches
              .filter((b) => b.id !== currentBranchId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </Select>

          <Select
            label="対象SKU"
            value={transferSkuId}
            onChange={(e) => setTransferSkuId(e.target.value)}
          >
            <option value="">選択してください</option>
            {skuList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          <Input
            label="移動数量"
            type="number"
            min="1"
            value={transferQty}
            onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsTransferModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleTransferSubmit}>移動指示</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransferTab;
