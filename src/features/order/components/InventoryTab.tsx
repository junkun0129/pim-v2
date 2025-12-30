import { useDataContext } from "@/src/components/providers/dataProvider";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Modal from "@/src/components/ui/Modal";
import { ICONS } from "@/src/constants";
import { useEffect, useState } from "react";

const InventoryTab = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedSkuForOrder, setSelectedSkuForOrder] = useState<string | null>(
    null
  );
  const [orderQuantity, setOrderQuantity] = useState<number>(10);
  const { currentBranchId, inventoryList, fetchInventoryList } =
    useDataContext();

  useEffect(() => {
    fetchInventoryList();
  }, [currentBranchId]);

  // Handlers
  const handleOpenOrderModal = (skuId: string) => {
    setSelectedSkuForOrder(skuId);
    setOrderQuantity(10);
    setIsOrderModalOpen(true);
  };
  const handleSubmitOrder = () => {
    if (selectedSkuForOrder && currentBranchId) {
      //   onCreateOrder({
      //     branchId: currentBranchId,
      //     skuId: selectedSkuForOrder,
      //     quantity: orderQuantity,
      //   });
      setIsOrderModalOpen(false);
    }
  };
  const displayList = inventoryList[currentBranchId] ?? [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
            <tr>
              <th className="px-6 py-3">商品画像</th>
              <th className="px-6 py-3">SKU名</th>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3 text-right">現在在庫</th>
              <th className="px-6 py-3">ステータス</th>
              <th className="px-6 py-3 text-center">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {displayList.map((item) => (
              <tr
                key={item.id}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.sku.name}
                      className="w-10 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400 text-xs">
                      No Img
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                  {item.sku.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">
                  {item.sku.skuId}
                </td>
                <td className="px-6 py-4 text-right font-bold text-lg whitespace-nowrap">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.quantity === 0 ? (
                    <Badge color="gray">在庫なし</Badge>
                  ) : item.status === "LOW" ? (
                    <Badge color="red" className="bg-red-100 text-red-800">
                      残りわずか
                    </Badge>
                  ) : (
                    <Badge color="green">在庫あり</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <Button
                    size="sm"
                    onClick={() => handleOpenOrderModal(item.id)}
                  >
                    <span className="flex items-center">
                      {ICONS.clipboard}
                      <span className="ml-1">発注</span>
                    </span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="発注依頼"
      >
        <div className="space-y-4">
          <Input
            label="発注数量"
            type="number"
            min="1"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsOrderModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmitOrder}>発注確定</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryTab;
