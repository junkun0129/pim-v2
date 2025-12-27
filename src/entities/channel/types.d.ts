export interface ExportColumn {
  id: string;
  headerName: string; // The column name in the export file (e.g. "product-title")
  sourceField: string; // The internal field path (e.g. "name", "price", "attribute.size")
  fallbackSourceField?: string; // New: Fallback field if primary is empty
  defaultValue?: string;
}

export interface ExportChannel {
  id: string;
  name: string; // e.g. "Amazon JP", "Rakuten", "Shopify"
  fileFormat: "CSV" | "TSV";
  columns: ExportColumn[];
  lastExported?: string;
}
