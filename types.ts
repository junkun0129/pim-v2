
export interface Attribute {
  id: string;
  name: string;
}

export interface AttributeSet {
  id: string;
  name: string;
  attributeIds: string[];
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Asset {
    id: string;
    type: 'IMAGE' | 'DESIGN';
    name: string;
    url: string;
    createdAt: string;
    branchId?: string; // Optional: Link asset to specific branch
}

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

// --- New OMS Types ---

export type BranchType = 'RETAIL' | 'EC';

export interface Branch {
    id: string;
    name: string;
    location: string;
    type: BranchType;
}

export interface Inventory {
    skuId: string;
    branchId: string;
    quantity: number;
    lastUpdated: string;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface Order {
    id: string;
    branchId: string;
    skuId: string;
    quantity: number;
    status: OrderStatus;
    orderDate: string;
}

export interface CustomerOrder {
    id: string;
    customerName: string;
    skuId: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
    status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
}

export type ViewType = 'SKUs' | 'Series' | 'Categories' | 'Attributes' | 'Attribute Sets' | 'SKU_DETAIL' | 'Orders' | 'EC' | 'CREATIVE' | 'CATALOG' | 'PROJECTS';

// --- Creative Studio Types ---

export type ElementType = 'RECT' | 'CIRCLE' | 'TEXT' | 'IMAGE';

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
    imageUrl?: string;
    // Template markers
    isSkuName?: boolean;
    isSkuPrice?: boolean;
    isSkuBarcode?: boolean;
    isSkuImage?: boolean;
}

export interface PopTemplate {
    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    elements: Omit<DesignElement, 'id'>[];
}

// --- Web Catalog Types ---

export type CatalogSectionType = 'HERO' | 'GRID_CATEGORY' | 'SPOTLIGHT_SKU';

export interface CatalogSection {
    id: string;
    type: CatalogSectionType;
    title?: string;
    subtitle?: string;
    targetId?: string; // ID of Category or SKU depending on type
    imageUrl?: string; // For Hero background
}

export interface WebCatalog {
    id: string;
    name: string;
    description: string;
    themeColor: string; // Hex code
    sections: CatalogSection[];
    status: 'DRAFT' | 'PUBLISHED';
    lastUpdated: string;
}

// --- Project / Collaboration Types ---

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
    memberIds: string[];
    createdAt: string;
    dueDate?: string;
}

export interface ChatMessage {
    id: string;
    projectId: string;
    userId: string;
    content: string;
    timestamp: string;
}

export interface BrainstormIdea {
    id: string;
    projectId: string;
    userId: string;
    content: string;
    color: 'yellow' | 'pink' | 'blue' | 'green';
    votes: number; // simple like count
}