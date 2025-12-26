import { api } from "@/src/entities/api";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import Select from "@/src/components/ui/Select";
import { useState, useMemo, useEffect } from "react";
import { Attribute } from "@/src/entities/attr/type";
import { Series } from "@/src/entities/series/types";
import { Category } from "@/src/entities/category/types";
type Props = {
  open: boolean;
  onClose: () => void;
  selectedAttrs: Attribute[];
  selectedSeries: Series;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  setSelectedSeries: (series: Series) => void;
  setSelectedAttrs: (attrs: Attribute[]) => void;
  dataMap: {
    series: Series[];
    categories: Category[];
    attributes: Attribute[];
  };
};
const SkuFIlterModal = ({
  open,
  onClose,
  selectedAttrs,
  selectedSeries,
  selectedCategory,
  setSelectedCategory,
  setSelectedSeries,
  setSelectedAttrs,
  dataMap,
}: Props) => {
  const [categories, setcategories] = useState<Category[]>([]);
  const [series, setseries] = useState<Series[]>([]);
  const [attrs, setattrs] = useState<Attribute[]>([]);
  const [selectedAttr, setselectedAttr] = useState<Attribute>();
  const [targetAttrValue, settargetAttrValue] = useState<string>("");

  function handleAddAttributeFilter() {
    if (!selectedAttr || !targetAttrValue) return;
    setSelectedAttrs([
      ...selectedAttrs,
      { ...selectedAttr, value: targetAttrValue },
    ]);
    setselectedAttr(null);
    settargetAttrValue("");
  }
  function handleRemoveAttributeFilter(index: number) {
    setSelectedAttrs(selectedAttrs.filter((_, i) => i !== index));
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="詳細検索・絞り込み">
      <div className="space-y-6">
        {/* Basic Filters */}
        <div className="space-y-4">
          <Select
            label="カテゴリ"
            value={selectedCategory?.id}
            onChange={(e) => {
              const found = dataMap.categories.find(
                (i) => i.id === e.target.value
              );
              setSelectedCategory(found ?? null);
            }}
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((c: Category) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="シリーズ"
            value={selectedSeries?.id}
            onChange={(e) => {
              const found = dataMap.series.find((i) => i.id === e.target.value);
              setSelectedSeries(found ?? null);
            }}
          >
            <option value="">すべてのシリーズ</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 my-4"></div>

        {/* Attribute Filters */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            属性フィルタ追加
          </label>
          <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <Select
              value={selectedAttr?.id}
              onChange={(e) => {
                const found = dataMap.attributes.find(
                  (i) => i.id === e.target.value
                );
                setselectedAttr(found ?? null);
              }}
            >
              <option value="">属性を選択...</option>
              {attrs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
            <input
              type="text"
              value={targetAttrValue}
              onChange={(e) => settargetAttrValue(e.target.value)}
              placeholder="値を入力 (例: Red, 64GB)"
              className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-800"
              onKeyDown={(e) => e.key === "Enter" && handleAddAttributeFilter()}
            />
            <Button
              onClick={handleAddAttributeFilter}
              disabled={!selectedAttr || !targetAttrValue}
              variant="secondary"
              className="w-full"
            >
              条件リストに追加
            </Button>
          </div>
        </div>

        {/* Active Filters inside Modal */}
        {selectedAttrs.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">
              適用中の属性フィルタ
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedAttrs.map((filter, index) => (
                <Badge
                  key={index}
                  color="green"
                  className="flex items-center gap-1"
                >
                  {filter.name}
                  <button
                    onClick={() => handleRemoveAttributeFilter(index)}
                    className="ml-1 text-emerald-700 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>完了</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkuFIlterModal;
