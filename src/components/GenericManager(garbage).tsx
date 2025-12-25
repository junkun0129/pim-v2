import React, { useState, useMemo, useEffect, useRef } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import { ICONS } from "../src/constants";
import type {
  Attribute,
  AttributeSet,
  Category,
  Series,
  Sku,
  Permission,
  Asset,
} from "../src/types";
import Badge from "./ui/Badge";
import Select from "./ui/Select";
import { getCategoryPath } from "../utils";
import { api } from "../src/api";
import { APP_CONFIG } from "../src/config";

type Item = Category | Series | AttributeSet | Attribute;

interface GenericManagerProps {
  title: string;
  items: Item[];
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
  onUpdateAttributeSet?: (
    setId: string,
    attributeIds: string[],
    sharedAttributeIds: string[]
  ) => void;
  onUpdateSeries?: (series: Series) => void;
  onUpdateCategory?: (category: Category) => void;
  onViewSeries?: (seriesId: string) => void;
  dataMap?: {
    categories: Category[];
    attributes: Attribute[];
    attributeSets: AttributeSet[];
    series: Series[];
  };
  userPermissions: Permission[];
}

interface AttributeFilter {
  attributeId: string;
  value: string;
}

export default function GenericManager({
  title,
  items,
  onAdd,
  onDelete,
  onUpdateAttributeSet,
  onUpdateSeries,
  onUpdateCategory,
  onViewSeries,
  dataMap,
  userPermissions,
}: GenericManagerProps) {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Create/Edit Item State
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState(""); // For Attribute

  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<AttributeSet | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | undefined>(
    undefined
  );
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );

  // General Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Advanced Filter State for Series
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>(
    []
  );
  const [targetAttrId, setTargetAttrId] = useState("");
  const [targetAttrValue, setTargetAttrValue] = useState("");

  // Permissions
  const canCreate = userPermissions.includes("MASTER_CREATE");
  const canEdit = userPermissions.includes("MASTER_EDIT");
  const canDelete = userPermissions.includes("MASTER_DELETE");

  // Filter Items based on View
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Series specific advanced filters
      if (title === "シリーズ") {
        const series = item as Series;
        const categoryMatch = categoryFilter
          ? series.categoryIds.includes(categoryFilter)
          : true;
        if (!categoryMatch) return false;

        if (attributeFilters.length > 0) {
          const matchesAttributes = attributeFilters.every((filter) => {
            const val = series.attributeValues[filter.attributeId] || "";
            return val.toLowerCase().includes(filter.value.toLowerCase());
          });
          if (!matchesAttributes) return false;
        }
      }
      return true;
    });
  }, [items, searchTerm, title, categoryFilter, attributeFilters]);

  const handleSaveItem = () => {
    if (newItemName.trim()) {
      if (title === "属性") {
        onAdd({ name: newItemName, unit: newItemUnit });
      } else {
        onAdd({ name: newItemName });
      }
      setNewItemName("");
      setNewItemUnit("");
      setIsItemModalOpen(false);
    }
  };

  const handleSaveSeries = (seriesData: Omit<Series, "id" | "childSkuIds">) => {
    if (editingSeries && onUpdateSeries) {
      onUpdateSeries({ ...editingSeries, ...seriesData });
    } else {
      onAdd(seriesData);
    }
    setEditingSeries(undefined);
  };

  const handleSaveCategory = (catData: { name: string; parentId?: string }) => {
    if (editingCategory && onUpdateCategory) {
      onUpdateCategory({ ...editingCategory, name: catData.name });
    } else {
      onAdd(catData);
    }
    setEditingCategory(undefined);
  };

  // Helper for inline category creation from tree
  const handleAddChildCategory = (catData: {
    name: string;
    parentId: string;
  }) => {
    onAdd(catData);
  };

  const openSeriesCreate = () => {
    setEditingSeries(undefined);
    setIsItemModalOpen(true);
  };

  const openSeriesEdit = (series: Series) => {
    setEditingSeries(series);
    setIsItemModalOpen(true);
  };

  const openCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsItemModalOpen(true);
  };

  const openAttributeModal = (set: AttributeSet) => {
    setEditingSet(set);
    setIsAttributeModalOpen(true);
  };

  const handleUpdateAttributeSet = (
    updatedIds: string[],
    sharedIds: string[]
  ) => {
    if (editingSet && onUpdateAttributeSet) {
      onUpdateAttributeSet(editingSet.id, updatedIds, sharedIds);
    }
    setIsAttributeModalOpen(false);
    setEditingSet(null);
  };

  const singularTitle =
    title === "シリーズ"
      ? "シリーズ"
      : title.endsWith("s")
      ? title.slice(0, -1)
      : title;

  const renderSimpleList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => {
        // Determine display info based on type
        const attr = title === "属性" ? (item as Attribute) : null;
        return (
          <Card key={item.id} className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-white">
                {item.name}
              </span>
              {attr && attr.unit && (
                <span className="text-xs text-slate-400">
                  単位: {attr.unit}
                </span>
              )}
            </div>
            {canDelete && (
              <Button
                onClick={() => onDelete(item.id)}
                variant="danger"
                size="sm"
              >
                {ICONS.trash}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );

  const isSimpleManager = title === "属性";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          {title}
        </h1>
      </div>

      {isSimpleManager && (
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={`新規${singularTitle}を追加`}
        >
          <div className="space-y-4">
            <Input
              label="名前"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`${singularTitle}名を入力`}
            />
            {title === "属性" && (
              <Input
                label="単位 (Unit)"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="例: cm, kg, GB (任意)"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsItemModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveItem}>保存</Button>
            </div>
          </div>
        </Modal>
      )}

      {title === "シリーズ" && dataMap && (
        <SeriesModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onSave={handleSaveSeries}
          dataMap={dataMap}
          seriesToEdit={editingSeries}
        />
      )}

      {title === "カテゴリ" && (
        <CategoryModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onSave={handleSaveCategory}
          categories={items as Category[]}
          categoryToEdit={editingCategory}
        />
      )}

      {title === "属性セット" && editingSet && (
        <Modal
          isOpen={isAttributeModalOpen}
          onClose={() => setIsAttributeModalOpen(false)}
          title={`「${editingSet.name}」の属性を編集`}
        >
          <AttributeSetEditModalContent
            set={editingSet}
            allAttributes={dataMap?.attributes || []}
            onSave={handleUpdateAttributeSet}
            onClose={() => setIsAttributeModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const AttributeSetEditModalContent: React.FC<{
  set: AttributeSet;
  allAttributes: Attribute[];
  onSave: (selectedIds: string[], sharedIds: string[]) => void;
  onClose: () => void;
}> = ({ set, allAttributes, onSave, onClose }) => {
  const [selectedIds, setSelectedIds] = useState(set.attributeIds);
  const [sharedIds, setSharedIds] = useState(set.sharedAttributeIds || []);

  const handleSave = () => {
    onSave(selectedIds, sharedIds);
  };

  const toggleShared = (id: string) => {
    if (sharedIds.includes(id)) {
      setSharedIds((prev) => prev.filter((sid) => sid !== id));
    } else {
      setSharedIds((prev) => [...prev, id]);
    }
  };

  // Filter attributes that are currently selected to show in the shared toggle list
  const selectedAttributes = allAttributes.filter((a) =>
    selectedIds.includes(a.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <Select
          label="利用可能な属性 (全選択)"
          multiple
          value={selectedIds}
          onChange={(e) =>
            setSelectedIds(
              Array.from(
                e.target.selectedOptions,
                (opt: HTMLOptionElement) => opt.value
              )
            )
          }
          className="h-40"
        >
          {allAttributes.map((attr) => (
            <option key={attr.id} value={attr.id}>
              {attr.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedAttributes.length > 0 && (
        <div className="border-t pt-4 dark:border-zinc-700">
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">
            シリーズ共通属性の設定
          </label>
          <p className="text-xs text-slate-400 mb-3">
            チェックを入れた属性はシリーズ作成時に値を設定し、全SKUで共有されます。
          </p>
          <div className="max-h-40 overflow-y-auto space-y-2 border border-zinc-200 dark:border-zinc-700 rounded p-2">
            {selectedAttributes.map((attr) => (
              <label
                key={attr.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={sharedIds.includes(attr.id)}
                  onChange={() => toggleShared(attr.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {attr.name}
                </span>
                {attr.unit && (
                  <span className="text-xs text-slate-400">({attr.unit})</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
};
