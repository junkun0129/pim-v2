import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import { Asset, Sku } from "@/src/entities/sku/types";
import { getCategoryPath } from "@/src/utils";
import { useState } from "react";
import SkuModal from "../components/SkuModal";
import { APP_ROUTES, ICONS } from "@/src/constants";
import { useDataContext } from "@/src/components/providers/dataProvider";
import { useNavigate, useParams, useSearchParams } from "react-router";

export default function SkuDetailPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [seachParams, setseachParams] = useSearchParams();
  const navigate = useNavigate();
  const { skuList, seriesList, categoryList, attrList, attrSetList } =
    useDataContext();
  const { skuId } = useParams();
  const sku = skuList.find((i) => i.id === skuId);

  const series = sku.seriesId
    ? seriesList.find((s) => s.id === sku.seriesId)
    : null;
  const imageUrl = sku.imageUrl || series?.imageUrl;

  const getAttributeName = (id: string) =>
    attrList.find((a) => a.id === id)?.name || "不明";

  const attributeSource = series || sku;
  const allAttributeIds = attributeSource.attributeSetIds.flatMap(
    (setId) => attrSetList.find((as) => as.id === setId)?.attributeIds || []
  );

  function handleBack() {
    navigate(APP_ROUTES.SKU);
  }

  // Combine assets from SKU and Series (optional: series assets could be inherited)
  const assets = sku.assets || [];
  function handleUpdateData(updatedData: Omit<Sku, "id">) {}

  const handleSaveEdit = (updatedData: Omit<Sku, "id">) => {
    handleUpdateData(updatedData);
    setIsEditModalOpen(false);
  };

  const renderAsset = (asset: Asset) => {
    switch (asset.type) {
      case "VIDEO":
        return (
          <div
            key={asset.id}
            className="group relative bg-black rounded-md overflow-hidden aspect-square border border-zinc-800"
          >
            <video
              src={asset.url}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
              {asset.name}
            </div>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/30 rounded text-white"
              title="開く"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        );
      case "FILE":
        return (
          <div
            key={asset.id}
            className="group relative bg-slate-50 dark:bg-zinc-800 rounded-md overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center p-4 text-center hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-slate-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 break-all">
              {asset.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {asset.size || "Unknown size"}
            </p>
            <a
              href={asset.url}
              download
              className="absolute inset-0 z-10"
              aria-label="Download"
            ></a>
          </div>
        );
      default: // IMAGE or DESIGN
        return (
          <div
            key={asset.id}
            className="group relative aspect-square bg-slate-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-slate-200 dark:border-zinc-700"
          >
            <img
              src={asset.url}
              alt={asset.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-xs hover:underline bg-black/50 px-2 py-1 rounded"
              >
                拡大表示
              </a>
            </div>
            {asset.type === "DESIGN" && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                POP
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="secondary">
            &larr; SKU一覧に戻る
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {sku.name}
          </h1>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>編集</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={sku.name}
                className="w-full h-auto object-cover rounded-lg aspect-square"
              />
            ) : (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 aspect-square">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}
            <div className="mt-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-center">
              <p className="text-sm text-sky-600 dark:text-sky-300 font-medium">
                販売価格
              </p>
              <p className="text-2xl font-bold text-sky-800 dark:text-sky-100">
                {sku.price ? `¥${sku.price.toLocaleString()}` : "-"}
              </p>
            </div>
          </Card>

          {/* Assets Gallery */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">アセット</h2>
              <span className="text-xs text-slate-400">
                {assets.length} items
              </span>
            </div>

            {assets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {assets.map((asset) => renderAsset(asset))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                アセットがありません
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  名前
                </dt>
                <dd className="text-slate-900 dark:text-white font-medium">
                  {sku.name}
                </dd>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  SKU ID
                </dt>
                <dd className="text-slate-900 dark:text-white font-mono">
                  {sku.skuId}
                </dd>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  バーコード (JAN/EAN)
                </dt>
                <dd className="text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  {ICONS.list} {sku.barcode || "-"}
                </dd>
              </div>

              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  シリーズ
                </dt>
                <dd className="text-slate-900 dark:text-white">
                  {series?.name || "N/A"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">カテゴリ</h2>
            <div className="flex flex-wrap gap-2">
              {sku.categoryIds.map((catId) => (
                <Badge key={catId}>
                  {getCategoryPath(catId, categoryList)}
                </Badge>
              ))}
              {sku.categoryIds.length === 0 && (
                <p className="text-sm text-slate-500">カテゴリがありません</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">属性値</h2>
            <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800 border rounded-lg border-zinc-200 dark:border-zinc-700">
              {allAttributeIds.length > 0 ? (
                allAttributeIds.map((attrId) => (
                  <div
                    key={attrId}
                    className="flex justify-between items-center p-3"
                  >
                    <span className="font-medium text-slate-500 text-sm">
                      {getAttributeName(attrId)}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">
                      {attributeSource.attributeValues[attrId] || "N/A"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 p-4">属性値がありません</p>
              )}
            </div>
            {series && allAttributeIds.length > 0 && (
              <div className="pt-2 mt-2 flex justify-end">
                <Badge color="purple" className="text-xs">
                  一部の値はシリーズから継承されています
                </Badge>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <SkuModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
          dataMap={{
            series: seriesList,
            attributes: attrList,
            attributeSets: attrSetList,
            categories: categoryList,
          }}
          sku={sku}
        />
      )}
    </div>
  );
}
