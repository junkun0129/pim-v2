export interface PopTemplate {
  id: string;
  name: string;
  description: string;
  width?: number; // New: Template Dimensions
  height?: number; // New: Template Dimensions
  backgroundColor: string;
  elements: Omit<DesignElement, "id">[];
}
export type ElementType = "RECT" | "CIRCLE" | "TEXT" | "IMAGE";

export interface DesignElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string; // New: Font Family support
  imageUrl?: string;
  // Template markers
  isSkuName?: boolean;
  isSkuPrice?: boolean;
  isSkuBarcode?: boolean;
  isSkuImage?: boolean;
}
