import React, { useState, useEffect, useMemo, useRef } from "react";

import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { getCategoryPath } from "../../../utils";
import { APP_CONFIG } from "../../../config";
import { Sku } from "@/src/entities/sku/types";
import { Category, CategoryOption } from "@/src/entities/category/types";
import { Series, SeriesOption } from "@/src/entities/series/types";
import {
  AttributeSet,
  AttrSetOption,
  AttrSetOptionAttrItem,
} from "@/src/entities/attrset/type";
import { Attribute } from "@/src/entities/attr/type";
import { useDataContext } from "@/src/components/providers/dataProvider";
import SearchablePicker from "@/src/components/ui/SearchablePicker";

interface SkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sku: Omit<Sku, "id">) => void;
  sku?: Sku; // for editing in the future
}

export default function SkuModal({
  isOpen,
  onClose,
  onSave,
  sku,
}: SkuModalProps) {
  const {
    seriesOptionList,
    fetchSeriesOptionList,
    attrSetOptionList,
    categoryOptionList,
    getCategoryOptionList,
    getAttrSetOptionList,
  } = useDataContext();

  const [name, setName] = useState(sku?.name || "");
  const [skuId, setSkuId] = useState(sku?.skuId || "");
  const [barcode, setBarcode] = useState(sku?.barcode || "");
  const fileRef = useRef<File>(null);
  const [price, setPrice] = useState<string>(
    sku?.price ? String(sku.price) : ""
  );

  const [selectedSeries, setselectedSeries] = useState<SeriesOption | null>(
    sku?.series
      ? {
          id: sku.series.id,
          name: sku.series.name,
          sharedAttrs: sku.series.attrValues,
          createdAt: sku.series.createdAt,
        }
      : null
  );
  const [selectedCategories, setselectedCategories] = useState<
    CategoryOption[]
  >(
    sku?.categoryries
      ? sku.categoryries.map((i) => ({
          id: i.id,
          name: i.name,
          createdAt: i.createdAt,
          subtext: i.relativePaths.join(" < "),
        }))
      : []
  );
  const [selectedAttrs, setselectedAttrs] = useState<AttrSetOption[]>(
    sku?.attrSets || []
  );

  const [SelectedAttrValues, setSelectedAttrValues] = useState<
    Record<string, string>
  >({});

  const [imageUrl, setImageUrl] = useState(sku?.imageUrl || "");

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSeriesOptionList(),
      getCategoryOptionList(),
      getAttrSetOptionList(),
    ]);

    return () => {
      fileRef.current = null;
    };
  }, []);

  // Calculate which attributes are editable (Unique) vs Read-only (Shared)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileRef.current = file;
    }
  };

  const handleSave = () => {
    if (name && skuId) {
      // onSave({
      //   name,
      //   skuId,
      //   barcode,
      //   price: price ? parseInt(price) : undefined,
      //   seriesId: seriesId || undefined,
      //   categoryIds,
      //   attributeSetIds: isSeriesSelected ? [] : attributeSetIds, // If series selected, sets are on series
      //   attributeValues,
      //   imageUrl: imageUrl || undefined,
      // });
      onClose();
    }
  };

  const selectedAttrsConfig = useMemo(() => {
    const unique: AttrSetOptionAttrItem[] = [];
    const shared: AttrSetOptionAttrItem[] = [];
    selectedAttrs.map((attrset) => {
      attrset.attrs.map((attr) => {
        if (attr.isUnique) {
          unique.push(attr);
        } else {
          shared.push(attr);
        }
      });
    });
    return { unique, shared };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sku ? "SKUを編集" : "新規SKUを追加"}
    >
      <div className="space-y-4">
        <Input
          label="SKU名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: iPhone 14 Pro"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU ID"
            value={skuId}
            onChange={(e) => setSkuId(e.target.value)}
            placeholder="例: IP14P-128-BLK"
            required
          />
          <Input
            label="バーコード (JAN/EAN)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="例: 4549995359787"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="販売価格 (¥)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            画像
          </label>
          <div className="mt-1 flex items-center gap-4">
            <span className="h-20 w-20 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="プレビュー"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </span>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <SearchablePicker<SeriesOption>
          items={seriesOptionList}
          selectedIds={selectedSeries ? [selectedSeries.id] : []}
          onToggle={setselectedSeries}
          multi={false}
          label={"所属シリーズ（任意）"}
        />

        {/*  Categories - Read only if Series selected? No, usually inherited but maybe overridable. For now, let's allow edit but default to series */}
        <SearchablePicker<CategoryOption>
          items={categoryOptionList}
          selectedIds={selectedCategories.map((i) => i.id)}
          onToggle={(item) => {
            const set = new Set(selectedCategories);
            if (set.has(item as CategoryOption)) {
              set.delete(item);
            } else {
              set.add(item);
            }
            setselectedCategories(Array.from(new Set(set)));
          }}
          label={"カテゴリ"}
        />

        {/* Attribute Sets Selection - Only if NO series selected */}
        <SearchablePicker<AttrSetOption>
          items={attrSetOptionList}
          selectedIds={selectedAttrs.map((i) => i.id)}
          onToggle={(item) => {
            const set = new Set(selectedAttrs);
            if (set.has(item)) {
              set.delete(item);
            } else {
              set.add(item);
            }
            setselectedAttrs(Array.from(set));
          }}
          label={"属性セット"}
        />

        {/* Shared Attributes Display (Read Only) */}
        {selectedSeries && selectedAttrsConfig.shared.length > 0 && (
          <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
              共通属性 (シリーズ設定)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedAttrsConfig.shared.map((attr) => (
                <div key={attr.id} className="text-sm">
                  <span className="text-slate-500 block text-xs">
                    {attr.name}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {selectedSeries.sharedAttrs[attr.id] || "-"} {attr.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unique Attributes Input */}
        {selectedAttrsConfig.unique.length > 0 && (
          <div className="space-y-3 pt-3 border-t dark:border-slate-600">
            <h4 className="font-semibold text-sm">独自属性値</h4>
            {selectedAttrsConfig.unique.map((attr) => (
              <Input
                key={attr.id}
                label={`${attr.name} ${attr.unit ? `(${attr.unit})` : ""}`}
                value={setSelectedAttrValues[attr.id] || ""}
                onChange={(e) =>
                  setSelectedAttrValues((prev) => ({
                    ...prev,
                    [attr.id]: e.target.value,
                  }))
                }
                placeholder={`${attr.name}の値を入力`}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? "処理中..." : "SKUを保存"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
