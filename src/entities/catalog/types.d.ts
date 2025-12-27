export type CatalogSectionType =
  | "HERO"
  | "GRID_CATEGORY"
  | "SPOTLIGHT_SKU"
  | "RICH_TEXT"
  | "VIDEO"
  | "IMAGE_GALLERY";

export interface CatalogSection {
  id: string;
  type: CatalogSectionType;
  title?: string;
  subtitle?: string;
  content?: string; // For Rich Text
  targetId?: string; // ID of Category or SKU depending on type
  imageUrl?: string; // For Hero background or single image
  videoUrl?: string; // For Video section
  imageUrls?: string[]; // For Gallery
}

export interface WebCatalog {
  id: string;
  name: string;
  description: string;

  // Customization / Culture
  themeColor: string; // Hex code
  fontFamily: "SANS" | "SERIF" | "MONO";
  cornerStyle: "SHARP" | "ROUNDED" | "PILL";
  logoUrl?: string;

  sections: CatalogSection[];
  status: "DRAFT" | "PUBLISHED";
  lastUpdated: string;
}
