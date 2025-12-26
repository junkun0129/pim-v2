import { Attribute } from "@/src/types";

export interface Sku {
  id: string;
  name: string;
  skuId: string;
  barcode?: string; // New field for JAN/EAN/UPC code
  price?: number;
  seriesId?: string;
  categoryIds: string[];
  attributeSetIds: string[];
  attributeValues: Record<string, string>;
  imageUrl?: string;
  assets?: Asset[]; // New field for multiple images/designs
}
export type Pagination = {
  currentPage: number;
  pageSize: number;
  total: number;
};

export interface Asset {
  id: string;
  type: "IMAGE" | "DESIGN" | "VIDEO" | "FILE";
  name: string;
  url: string;
  createdAt: string;
  branchId?: string; // Optional: Link asset to specific branch
  mimeType?: string; // Optional: specific mime type
  size?: string;
}

export type GetSkuRequestBody = {
  pagination: Omit<Pagination, "total">;
  searchTerm: string;
  attrIds: string[];
  seriesId: string;
  categoryId: string;
};

export type UseSkuProps = {
  skuList: Sku[];
  skuPagination: Pagination;
  setskuPagination: React.Dispatch<React.SetStateAction<Pagination>>;
  seriesFilter: Series;
  setSeriesFilter: React.Dispatch<React.SetStateAction<Series>>;
  categoryFilter: Category;
  setCategoryFilter: React.Dispatch<React.SetStateAction<Category>>;
  attributeFilters: Attribute[];
  setAttributeFilters: React.Dispatch<React.SetStateAction<Attribute[]>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedIds: string[];
  setselectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};
