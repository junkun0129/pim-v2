import { Series } from "../series/types";
import { Category } from "../category/types";
import { AttributeSet, AttrSetOption } from "../attrset/type";
import { Attribute } from "../attr/type";
export interface Sku {
  id: string;
  name: string;
  skuId: string;
  barcode?: string;
  price?: number;
  series?: Series;
  categoryries: Category[];
  attrSets: AttrSetOption[];
  attrValues: Record<string, string>;
  imageUrl?: string;
  assets?: Asset[]; // New field for multiple images/designs
}

export type SkuOptions = {
  attrSets: AttrSetOption[];
  categories: CategoryOption[];
  series: SeriesOption[];
};

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
  loadOptionsForSku: () => void;
  skuOptions: SkuOptions;
  loadSkuList: () => void;
};
