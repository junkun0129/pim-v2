import { useState } from "react";
import SkuTable from "../components/SkuTable";
import SkuModal from "../components/SkuModal";
import ImportModal from "../components/ImportModal";
import Button from "../../../components/ui/Button";
import { APP_ROUTES, ICONS } from "../../../constants";
import Badge from "../../../components/ui/Badge";
import { getCategoryPath } from "../../../utils";
import SkuFIlterModal from "../components/SkuFIlterModal";
import { useDataContext } from "@/src/components/providers/dataProvider";
import { Sku } from "@/src/entities/sku/types";
import { useNavigate } from "react-router";

export default function SkuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const navigate = useNavigate();
  const [editingSku, setEditingSku] = useState<Sku | undefined>(undefined);
  const {
    skuList,
    skuPagination,
    searchTerm,
    selectedIds,
    seriesFilter,
    categoryFilter,
    setAttributeFilters,
    attributeFilters,
    setCategoryFilter,
    setSearchTerm,
    setSeriesFilter,
    setselectedIds,
    setskuPagination,
    seriesList,
    categoryList,
    attrList,
    attrSetList,
  } = useDataContext();
  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    const oldSet = new Set(selectedIds);
    if (oldSet.has(id)) {
      oldSet.delete(id);
    } else {
      oldSet.add(id);
    }
    setselectedIds([...oldSet]);
  };

  const handleToggleAllPage = (checked: boolean) => {
    // implement here later
  };

  // implement here later
  const isAllPageSelected = false;

  const handleOpenCreateModal = () => {
    setEditingSku(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sku: Sku) => {
    setEditingSku(sku);
    setIsModalOpen(true);
  };

  const handleSaveSku = (skuData: Omit<Sku, "id">) => {
    if (editingSku) {
      // # update sku
    } else {
      // # create sku
    }
  };

  const handleExport = () => {};

  // Generate Import Template / Sheet
  const handleGenerateTemplate = () => {};

  const handleNavigateToSkuDetailPage = (id: string) => {
    const url = APP_ROUTES.SKU_DETAIL.replace(":skuId", id);
    navigate(url);
  };

  const handleRemoveAttributeFilter = (index: number) => {
    const newArray = [...attributeFilters].filter((a, i) => i !== index);
    setAttributeFilters(newArray);
  };

  const activeFilterCount =
    (categoryFilter ? 1 : 0) + (seriesFilter ? 1 : 0) + attributeFilters.length;
  const totalPages = Math.max(skuPagination.total / skuPagination.pageSize);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* title */}
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">
          SKU Management
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button
            variant="secondary"
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none"
          >
            {ICONS.upload} <span className="ml-2">Import</span>
          </Button>

          <div className="relative group">
            {/* Split Export Button */}
            <div className="flex rounded-lg shadow-sm">
              <Button
                variant="secondary"
                onClick={handleExport}
                className="rounded-r-none border-r-0 flex-1 sm:flex-none"
              >
                {ICONS.download} <span className="ml-2">Export</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleGenerateTemplate}
                className="rounded-l-none px-2"
                title="選択したSKUからインポート用シートを作成"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </Button>
            </div>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none shadow-lg shadow-zinc-900/20"
          >
            {ICONS.plus} <span className="ml-2">Add SKU</span>
          </Button>
        </div>
      </div>

      {/* Compact Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            {ICONS.search}
          </span>
          <input
            type="text"
            placeholder="名前またはSKU IDで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-0"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsFilterModalOpen(true)}
          className={`shrink-0 ${
            activeFilterCount > 0
              ? "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300"
              : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filter Chips & Selection Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        {/* Left: Filters */}
        {activeFilterCount > 0 ? (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase mr-2">
              Filters:
            </span>

            {categoryFilter && (
              <Badge color="blue" className="flex items-center gap-1 pr-1">
                カテゴリ: {categoryFilter.relativePaths.join(" > ")}
                <button
                  onClick={() => setCategoryFilter(null)}
                  className="p-0.5 hover:bg-blue-200 rounded-full"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </Badge>
            )}

            {seriesFilter && (
              <Badge color="purple" className="flex items-center gap-1 pr-1">
                シリーズ: {seriesFilter.name}
                <button
                  onClick={() => setSeriesFilter(null)}
                  className="p-0.5 hover:bg-purple-200 rounded-full"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </Badge>
            )}

            {attributeFilters.map((filter, index) => (
              <Badge
                key={index}
                color="green"
                className="flex items-center gap-1 pr-1"
              >
                {filter.name}
                <button
                  onClick={() => handleRemoveAttributeFilter(index)}
                  className="p-0.5 hover:bg-emerald-200 rounded-full"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </Badge>
            ))}

            <button
              onClick={() => {
                setCategoryFilter(null);
                setSeriesFilter(null);
                setAttributeFilters([]);
              }}
              className="text-xs text-red-500 hover:text-red-700 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        ) : (
          <div></div>
        )}

        {/* Right: Selection Count */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              {selectedIds.length} 件選択中
            </span>
            <button
              onClick={() => setselectedIds([])}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              クリア
            </button>
          </div>
        )}
      </div>

      <SkuTable
        skus={skuList}
        onDelete={(id: string) => {
          // implement it later
          console.log(id);
        }}
        onViewSku={handleNavigateToSkuDetailPage}
        onEdit={(sku: Sku) => {
          // implement it later
          console.log(sku, "sku to be edited");
        }}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAllPage}
        isAllSelected={isAllPageSelected}
        categoryList={categoryList}
      />

      {/* Pagination Controls - Sticky Bottom */}
      {skuList?.length > 0 && (
        <div className="sticky bottom-0 z-10 bg-zinc-50/95 dark:bg-black/95 backdrop-blur-md -mx-4 md:-mx-8 px-4 md:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>
              全 {skuPagination.total} 件中{" "}
              {(skuPagination.currentPage - 1) * skuPagination.pageSize + 1} -{" "}
              {Math.min(
                skuPagination.currentPage * skuPagination.pageSize,
                skuList?.length
              )}{" "}
              件を表示
            </span>
            <select
              value={skuPagination.pageSize}
              onChange={(e) =>
                setskuPagination((pre) => ({
                  ...pre,
                  pageSize: Number(e.target.value),
                }))
              }
              className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded text-xs py-1 shadow-sm"
            >
              <option value={10}>10件 / ページ</option>
              <option value={20}>20件 / ページ</option>
              <option value={50}>50件 / ページ</option>
              <option value={100}>100件 / ページ</option>
            </select>
          </div>
          {skuPagination.total > 1 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setskuPagination((pre) => ({
                    ...pre,
                    currentPage: Math.max(1, pre.currentPage - 1),
                  }))
                }
                disabled={skuPagination.currentPage === 1}
              >
                前へ
              </Button>
              <div className="flex items-center px-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {skuPagination.currentPage} / {totalPages}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setskuPagination((pre) => ({
                    ...pre,
                    currentPage: Math.max(1, pre.currentPage + 1),
                  }))
                }
                disabled={skuPagination.currentPage === totalPages}
              >
                次へ
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <SkuFIlterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedAttrs={attributeFilters}
        selectedSeries={seriesFilter}
        selectedCategory={categoryFilter}
        setSelectedCategory={setCategoryFilter}
        setSelectedSeries={setSeriesFilter}
        setSelectedAttrs={setAttributeFilters}
        dataMap={{
          series: seriesList,
          attributes: attrList,
          categories: categoryList,
        }}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <SkuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSku}
          sku={editingSku}
        />
      )}

      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={() => console.log("import ")}
        />
      )}
    </div>
  );
}
