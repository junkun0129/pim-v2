import { useCallback, useEffect, useState } from "react";
import { Pagination, Sku } from "./types";
import { api } from "../api";
import { Category } from "../category/types";
import { Attribute } from "../attr/type";
import { Series } from "../series/types";

export const useSku = () => {
  // display list
  const [skuList, setskuList] = useState<Sku[]>([]);

  // pagination
  const [skuPagination, setskuPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<Series | null>(null);
  const [attributeFilters, setAttributeFilters] = useState<Attribute[]>([]);

  // selected sku on a table
  const [selectedIds, setselectedIds] = useState<string[]>([]);

  useEffect(() => {
    getSkuList();
  }, [
    skuPagination.currentPage,
    skuPagination.pageSize,
    searchTerm,
    categoryFilter,
    seriesFilter,
    attributeFilters,
  ]);

  async function getSkuList() {
    const rawList = await api.getSkuList({
      pagination: {
        pageSize: skuPagination.pageSize,
        currentPage: skuPagination.currentPage,
      },
      attrIds: attributeFilters.map((i) => i.id),
      seriesId: seriesFilter?.id ?? "",
      categoryId: categoryFilter?.id ?? "",
      searchTerm: searchTerm,
    });
    console.log(rawList);
    setskuList(rawList.item);
  }

  return {
    skuList,
    skuPagination,
    setskuPagination,
    seriesFilter,
    setSeriesFilter,
    categoryFilter,
    setCategoryFilter,
    attributeFilters,
    setAttributeFilters,
    searchTerm,
    setSearchTerm,
    selectedIds,
    setselectedIds,
  };
};
