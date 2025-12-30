import { Asset } from "../sku/types";

export interface Series {
  id: string;
  name: string;
  childSkuIds: string[];
  categoryIds: string[];
  attributeSetIds: string[];
  attributeValues: Record<string, string>;
  createdAt: string;
  imageUrl?: string;
  assets?: Asset[]; // New field
}

export type UseSeriesProps = {
  seriesList: Series[];
  seriesOptionList: SeriesOption[];
  fetchSeriesOptionList: () => void;
};

export type SeriesOption = {
  id: string;
  name: string;
  createdAt: string;
  sharedAttrs: Record<string, string>;
};
