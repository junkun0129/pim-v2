import Badge from "../../../components/ui/Badge";
import { ICONS } from "../../../constants";
import Button from "../../../components/ui/Button";
import { getCategoryPath } from "../../../utils";
import { Sku } from "@/src/entities/sku/types";
import { useDataContext } from "@/src/components/providers/dataProvider";
import { Category } from "@/src/entities/category/types";

interface SkuTableProps {
  skus: Sku[];
  onDelete: (id: string) => void;
  onViewSku: (skuId: string) => void;
  onEdit: (sku: Sku) => void;
  // Selection Props
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  isAllSelected?: boolean;
  categoryList: Category[];
}

export default function SkuTable({
  skus,
  onDelete,
  onViewSku,
  onEdit,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  isAllSelected,
  categoryList,
}: SkuTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
            <tr>
              <th scope="col" className="p-4 w-4">
                {onToggleAll && (
                  <div className="flex items-center">
                    <input
                      id="checkbox-all"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={isAllSelected || false}
                      onChange={(e) => onToggleAll(e.target.checked)}
                    />
                    <label htmlFor="checkbox-all" className="sr-only">
                      checkbox
                    </label>
                  </div>
                )}
              </th>
              <th scope="col" className="px-6 py-3">
                画像
              </th>
              <th scope="col" className="px-6 py-3">
                名前
              </th>
              <th scope="col" className="px-6 py-3">
                SKU ID / JAN
              </th>
              <th scope="col" className="px-6 py-3">
                価格
              </th>
              <th scope="col" className="px-6 py-3">
                シリーズ
              </th>
              <th scope="col" className="px-6 py-3">
                カテゴリ
              </th>
              <th scope="col" className="px-6 py-3">
                属性値
              </th>
              <th scope="col" className="px-6 py-3">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {skus?.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-slate-500 dark:text-slate-400"
                >
                  SKUが見つかりません。
                </td>
              </tr>
            ) : (
              skus.map((sku) => {
                const isSelected = selectedIds.includes(sku.id);

                return (
                  <tr
                    key={sku.id}
                    className={`
                      hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors
                      ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-white dark:bg-slate-800"
                      }
                    `}
                  >
                    <td className="w-4 p-4 whitespace-nowrap">
                      {onToggleSelect && (
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${sku.id}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={isSelected || false}
                            onChange={() => onToggleSelect(sku.id)}
                          />
                          <label
                            htmlFor={`checkbox-${sku.id}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sku.imageUrl ? (
                        <img
                          src={sku.imageUrl}
                          alt={sku.name}
                          className="w-10 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      <button
                        onClick={() => onViewSku(sku.id)}
                        className="text-sky-600 dark:text-sky-400 hover:underline font-semibold text-left"
                      >
                        {sku.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono">{sku.skuId}</span>
                        {sku.barcode && (
                          <span className="text-xs text-slate-400 font-mono mt-0.5">
                            {sku.barcode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {sku.price ? `¥${sku.price.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sku.series?.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {/* Use flex-nowrap and overflow to prevent height jumping */}
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mask-linear-fade">
                        {sku.categoryries.map((category) => (
                          <Badge
                            key={category.id}
                            className="whitespace-nowrap"
                          >
                            {category.relativePaths.join(" > ")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        属性
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onEdit(sku)}
                          variant="secondary"
                          size="sm"
                        >
                          編集
                        </Button>
                        <Button
                          onClick={() => onDelete(sku.id)}
                          variant="danger"
                          size="sm"
                        >
                          {ICONS.trash}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
