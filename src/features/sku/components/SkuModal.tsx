import React, { useState, useEffect, useMemo } from "react";

import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { getCategoryPath } from "../../../utils";
import { api } from "../../../entities/api";
import { APP_CONFIG } from "../../../config";
import { Sku } from "@/src/entities/sku/types";
import { Category } from "@/src/entities/category/types";
import { Series } from "@/src/entities/series/types";
import { AttributeSet } from "@/src/entities/attrset/type";
import { Attribute } from "@/src/entities/attr/type";

interface SkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sku: Omit<Sku, "id">) => void;
  dataMap: {
    series: Series[];
    categories: Category[];
    attributeSets: AttributeSet[];
    attributes: Attribute[];
  };
  sku?: Sku; // for editing in the future
}

export default function SkuModal({
  isOpen,
  onClose,
  onSave,
  dataMap,
  sku,
}: SkuModalProps) {
  const [name, setName] = useState(sku?.name || "");
  const [skuId, setSkuId] = useState(sku?.skuId || "");
  const [barcode, setBarcode] = useState(sku?.barcode || "");
  const [price, setPrice] = useState<string>(
    sku?.price ? String(sku.price) : ""
  );
  const [seriesId, setSeriesId] = useState(sku?.seriesId || "");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    sku?.categoryIds || []
  );
  const [attributeSetIds, setAttributeSetIds] = useState<string[]>(
    sku?.attributeSetIds || []
  );
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >(sku?.attributeValues || {});
  const [imageUrl, setImageUrl] = useState(sku?.imageUrl || "");

  const [isUploading, setIsUploading] = useState(false);

  const isSeriesSelected = !!seriesId;
  const selectedSeries = dataMap.series.find((s) => s.id === seriesId);

  // When Series changes, reset non-series stuff
  useEffect(() => {
    if (isSeriesSelected && selectedSeries) {
      // Inherit from Series
      setCategoryIds(selectedSeries.categoryIds);
      setAttributeSetIds(selectedSeries.attributeSetIds);
      // We don't overwrite attributeValues entirely, but we should clear values that are now shared?
      // Actually, keep existing values for editing, but UI will hide shared ones.
    } else if (!sku) {
      // Only reset if creating new and deselecting series
      setAttributeSetIds([]);
      setAttributeValues({});
    }
  }, [seriesId, selectedSeries, sku]);

  // Calculate which attributes are editable (Unique) vs Read-only (Shared)
  const attributeConfig = useMemo(() => {
    const uniqueAttrs: Attribute[] = [];
    const sharedAttrs: Attribute[] = [];

    const activeSetIds =
      isSeriesSelected && selectedSeries
        ? selectedSeries.attributeSetIds
        : attributeSetIds;

    activeSetIds.forEach((setId) => {
      const set = dataMap.attributeSets.find((s) => s.id === setId);
      if (set) {
        set.attributeIds.forEach((attrId) => {
          const attr = dataMap.attributes.find((a) => a.id === attrId);
          if (!attr) return;

          const isShared = set.sharedAttributeIds?.includes(attrId);

          if (isSeriesSelected && isShared) {
            sharedAttrs.push(attr);
          } else {
            uniqueAttrs.push(attr);
          }
        });
      }
    });

    // Deduplicate
    return {
      unique: Array.from(new Set(uniqueAttrs)),
      shared: Array.from(new Set(sharedAttrs)),
    };
  }, [
    attributeSetIds,
    isSeriesSelected,
    selectedSeries,
    dataMap.attributeSets,
    dataMap.attributes,
  ]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // If using MOCK data, just use Base64 to keep it working without backend
      if (APP_CONFIG.useMockData) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }

      // If using REAL API, upload to S3 (via API)
      setIsUploading(true);
      try {
        // const url = await api.uploadImage(file);
        // setImageUrl(url);
      } catch (err) {
        console.error("Upload failed", err);
        alert("画像のアップロードに失敗しました。");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    if (name && skuId) {
      onSave({
        name,
        skuId,
        barcode,
        price: price ? parseInt(price) : undefined,
        seriesId: seriesId || undefined,
        categoryIds,
        attributeSetIds: isSeriesSelected ? [] : attributeSetIds, // If series selected, sets are on series
        attributeValues,
        imageUrl: imageUrl || undefined,
      });
      onClose();
    }
  };

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

        <Select
          label="シリーズ (任意)"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        >
          <option value="">なし (単独SKU)</option>
          {dataMap.series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {/* Categories - Read only if Series selected? No, usually inherited but maybe overridable. For now, let's allow edit but default to series */}
        <Select
          label="カテゴリ"
          multiple
          value={categoryIds}
          onChange={(e) =>
            setCategoryIds(
              Array.from(
                e.target.selectedOptions,
                (option: HTMLOptionElement) => option.value
              )
            )
          }
        >
          {dataMap.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {getCategoryPath(c.id, dataMap.categories)}
            </option>
          ))}
        </Select>

        {/* Attribute Sets Selection - Only if NO series selected */}
        {!isSeriesSelected && (
          <div>
            <Select
              label="属性セット"
              multiple
              value={attributeSetIds}
              onChange={(e) =>
                setAttributeSetIds(
                  Array.from(
                    e.target.selectedOptions,
                    (option: HTMLOptionElement) => option.value
                  )
                )
              }
            >
              {dataMap.attributeSets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Shared Attributes Display (Read Only) */}
        {isSeriesSelected &&
          attributeConfig.shared.length > 0 &&
          selectedSeries && (
            <div className="bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                共通属性 (シリーズ設定)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {attributeConfig.shared.map((attr) => (
                  <div key={attr.id} className="text-sm">
                    <span className="text-slate-500 block text-xs">
                      {attr.name}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-white">
                      {selectedSeries.attributeValues[attr.id] || "-"}{" "}
                      {attr.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Unique Attributes Input */}
        {attributeConfig.unique.length > 0 && (
          <div className="space-y-3 pt-3 border-t dark:border-slate-600">
            <h4 className="font-semibold text-sm">独自属性値</h4>
            {attributeConfig.unique.map((attr) => (
              <Input
                key={attr.id}
                label={`${attr.name} ${attr.unit ? `(${attr.unit})` : ""}`}
                value={attributeValues[attr.id] || ""}
                onChange={(e) =>
                  setAttributeValues((prev) => ({
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
