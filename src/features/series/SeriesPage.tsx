import React from "react";

const renderSeries = () => {
    let seriesItems = filteredItems as Series[];
    const activeFilterCount =
      (categoryFilter ? 1 : 0) + attributeFilters.length;

    return (
      <div className="space-y-4">
        {/* Compact Search & Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              {ICONS.search}
            </span>
            <input
              type="text"
              placeholder="シリーズ名で検索..."
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

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center px-1">
            <span className="text-xs font-bold text-zinc-400 uppercase mr-2">
              Active Filters:
            </span>

            {categoryFilter && (
              <Badge color="blue" className="flex items-center gap-1 pr-1">
                カテゴリ:{" "}
                {getCategoryPath(categoryFilter, dataMap?.categories || [])
                  .split(">")
                  .pop()}
                <button
                  onClick={() => setCategoryFilter("")}
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

            {attributeFilters.map((filter, index) => (
              <Badge
                key={index}
                color="green"
                className="flex items-center gap-1 pr-1"
              >
                {
                  dataMap?.attributes.find((a) => a.id === filter.attributeId)
                    ?.name
                }
                : {filter.value}
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
                setCategoryFilter("");
                setAttributeFilters([]);
              }}
              className="text-xs text-red-500 hover:text-red-700 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 whitespace-nowrap">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    画像
                  </th>
                  <th scope="col" className="px-6 py-3">
                    名前
                  </th>
                  <th scope="col" className="px-6 py-3">
                    カテゴリ
                  </th>
                  <th scope="col" className="px-6 py-3">
                    属性値 (共通)
                  </th>
                  <th scope="col" className="px-6 py-3">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                {seriesItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      条件に一致するシリーズはありません
                    </td>
                  </tr>
                ) : (
                  seriesItems.map((series) => {
                    const allAttributeIds = series.attributeSetIds.flatMap(
                      (setId) =>
                        dataMap?.attributeSets.find((as) => as.id === setId)
                          ?.attributeIds || []
                    );
                    return (
                      <tr
                        key={series.id}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {series.imageUrl ? (
                            <img
                              src={series.imageUrl}
                              alt={series.name}
                              className="w-10 h-10 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
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
                            onClick={() =>
                              onViewSeries && onViewSeries(series.id)
                            }
                            className="hover:underline text-blue-600 dark:text-blue-400 font-bold"
                          >
                            {series.name}
                          </button>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {series.categoryIds.map((id) => (
                              <Badge key={id} className="whitespace-nowrap">
                                {getCategoryPath(id, dataMap?.categories || [])}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {Object.entries(series.attributeValues).map(
                              ([attrId, val]) => {
                                const attr = dataMap?.attributes.find(
                                  (a) => a.id === attrId
                                );
                                if (!val) return null;
                                return (
                                  <Badge
                                    key={attrId}
                                    color="purple"
                                    className="whitespace-nowrap"
                                  >
                                    {attr?.name}: {val}
                                  </Badge>
                                );
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() =>
                                onViewSeries && onViewSeries(series.id)
                              }
                              variant="secondary"
                              size="sm"
                            >
                              詳細
                            </Button>
                            {canEdit && (
                              <Button
                                onClick={() => openSeriesEdit(series)}
                                variant="secondary"
                                size="sm"
                              >
                                編集
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                onClick={() => onDelete(series.id)}
                                variant="danger"
                                size="sm"
                              >
                                {ICONS.trash}
                              </Button>
                            )}
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

        {/* Filter Modal for Series */}
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="詳細検索・絞り込み"
        >
          <div className="space-y-6">
            {/* Basic Filters */}
            <div className="space-y-4">
              <Select
                label="カテゴリ"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">すべてのカテゴリ</option>
                {dataMap?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryPath(c.id, dataMap.categories)}
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
                  value={targetAttrId}
                  onChange={(e) => setTargetAttrId(e.target.value)}
                >
                  <option value="">属性を選択...</option>
                  {dataMap?.attributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
                <input
                  type="text"
                  value={targetAttrValue}
                  onChange={(e) => setTargetAttrValue(e.target.value)}
                  placeholder="値を入力"
                  className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-zinc-800"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddAttributeFilter()
                  }
                />
                <Button
                  onClick={handleAddAttributeFilter}
                  disabled={!targetAttrId || !targetAttrValue}
                  variant="secondary"
                  className="w-full"
                >
                  条件リストに追加
                </Button>
              </div>
            </div>

            {/* Active Filters inside Modal */}
            {attributeFilters.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">
                  適用中の属性フィルタ
                </label>
                <div className="flex flex-wrap gap-2">
                  {attributeFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      color="green"
                      className="flex items-center gap-1"
                    >
                      {
                        dataMap?.attributes.find(
                          (a) => a.id === filter.attributeId
                        )?.name
                      }
                      : {filter.value}
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
              <Button onClick={() => setIsFilterModalOpen(false)}>完了</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

export default SeriesPage;
