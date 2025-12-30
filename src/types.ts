// --- Web Catalog Types ---

// --- Channel Export Types ---

// --- Store Types ---
export interface ExtensionMetadata {
  id: ExtensionType;
  name: string;
  description: string;
  price: number;
  icon: any; // We'll use the component key or name for now
}
