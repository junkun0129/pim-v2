export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}
export type UseRoleProps = {
  roleList: Role[];
};

export type Permission =
  // System: Master Data (SKU, Series, Categories)
  | "MASTER_VIEW"
  | "MASTER_CREATE"
  | "MASTER_EDIT"
  | "MASTER_DELETE"
  | "MASTER_IMPORT"
  | "MASTER_EXPORT"

  // System: OMS (Order Management)
  | "OMS_VIEW"
  | "OMS_ORDER_CREATE"

  // System: EC
  | "EC_VIEW"
  | "EC_MANAGE"

  // System: Creative (POP)
  | "CREATIVE_VIEW"
  | "CREATIVE_EDIT"

  // System: Web Catalog
  | "CATALOG_VIEW"
  | "CATALOG_EDIT"

  // System: Projects
  | "PROJECT_VIEW"
  | "PROJECT_CREATE"
  | "PROJECT_EDIT" // Add members, etc.

  // System: Admin
  | "ADMIN_VIEW"
  | "ADMIN_MANAGE";
