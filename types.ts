
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
    type: 'IMAGE' | 'DESIGN' | 'VIDEO' | 'FILE';
    name: string;
    url: string;
    createdAt: string;
    branchId?: string; // Optional: Link asset to specific branch
    mimeType?: string; // Optional: specific mime type
    size?: string;
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
    driverId?: string; // Assigned driver
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

export interface Complaint {
    id: string;
    branchId: string;
    title: string;
    content: string;
    status: 'OPEN' | 'RESOLVED';
    createdAt: string;
    response?: string;
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    currentLocation?: string;
}

export interface StockTransfer {
    id: string;
    fromBranchId: string;
    toBranchId: string;
    skuId: string;
    quantity: number;
    status: 'REQUESTED' | 'SHIPPED' | 'COMPLETED';
    date: string;
}

export type ViewType = 'SKUs' | 'Series' | 'Categories' | 'Attributes' | 'Attribute Sets' | 'SKU_DETAIL' | 'Orders' | 'EC' | 'CREATIVE' | 'CATALOG' | 'PROJECTS' | 'CHANNEL_EXPORT' | 'ADMIN';

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

export type CatalogSectionType = 'HERO' | 'GRID_CATEGORY' | 'SPOTLIGHT_SKU' | 'RICH_TEXT' | 'VIDEO' | 'IMAGE_GALLERY';

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
    fontFamily: 'SANS' | 'SERIF' | 'MONO';
    cornerStyle: 'SHARP' | 'ROUNDED' | 'PILL';
    logoUrl?: string;

    sections: CatalogSection[];
    status: 'DRAFT' | 'PUBLISHED';
    lastUpdated: string;
}

// --- Project / Collaboration Types ---

export interface User {
    id: string;
    name: string;
    avatarUrl?: string;
    roleId: string; // Link to Role
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

export interface FileAttachment {
    id: string;
    name: string;
    type: 'IMAGE' | 'VIDEO' | 'FILE';
    url: string;
    size?: string;
}

export interface BrainstormIdea {
    id: string;
    projectId: string;
    userId: string;
    content: string;
    color: 'yellow' | 'pink' | 'blue' | 'green';
    votes: number; // simple like count
    attachments: FileAttachment[]; // New: support for multimedia
    linkedDraftId?: string; // New: link to a created draft
}

export type DraftStatus = 'PROPOSAL' | 'REVIEW' | 'APPROVED' | 'REJECTED';

export interface SkuDraft {
    id: string;
    projectId: string;
    name: string;
    proposedSkuId: string;
    price?: number;
    description: string;
    status: DraftStatus;
    authorId: string;
    createdAt: string;
    linkedIdeaId?: string; // New: link back to idea
}

// --- Channel Export Types ---

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
    fileFormat: 'CSV' | 'TSV';
    columns: ExportColumn[];
    lastExported?: string;
}

// --- RBAC (Role Based Access Control) ---

export type Permission = 
    // System: Master Data (SKU, Series, Categories)
    | 'MASTER_VIEW'
    | 'MASTER_CREATE'
    | 'MASTER_EDIT'
    | 'MASTER_DELETE'
    | 'MASTER_IMPORT'
    | 'MASTER_EXPORT'
    
    // System: OMS (Order Management)
    | 'OMS_VIEW'
    | 'OMS_ORDER_CREATE'
    
    // System: EC
    | 'EC_VIEW'
    | 'EC_MANAGE'
    
    // System: Creative (POP)
    | 'CREATIVE_VIEW'
    | 'CREATIVE_EDIT'
    
    // System: Web Catalog
    | 'CATALOG_VIEW'
    | 'CATALOG_EDIT'
    
    // System: Projects
    | 'PROJECT_VIEW'
    | 'PROJECT_CREATE'
    | 'PROJECT_EDIT' // Add members, etc.
    
    // System: Admin
    | 'ADMIN_VIEW'
    | 'ADMIN_MANAGE';

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
    description?: string;
}