import { Asset } from "../sku/types";

export interface Series {
  id: string;
  name: string;
  childSkuIds: string[];
  categoryIds: string[];
  attributeSetIds: string[];
  attributeValues: Record<string, string>;
  imageUrl?: string;
  assets?: Asset[]; // New field
}

export type UseSeriesProps = {
  seriesList: Series[];
};
