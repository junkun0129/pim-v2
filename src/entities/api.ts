import { APP_CONFIG } from "../config";
import { Attribute } from "./attr/type";
import { AttributeSet, AttrSetOption } from "./attrset/type";
import { Category, CategoryOption } from "./category/types";
import { Complaint, Driver, Order, StockTransfer } from "./order/types";
import { Role } from "./role/types";
import { Series, SeriesOption } from "./series/types";
import { GetSkuRequestBody, Sku } from "./sku/types";

const BASE_URL = APP_CONFIG.apiBaseUrl;

const headers = {
  "Content-Type": "application/json",
};

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const api = {
  // --- Series ---
  getSeriesList: async () => fetchRequest<void, Series[]>("GET", "series/list"),
  getSeriesOptionsList: async () =>
    fetchRequest<void, SeriesOption[]>("GET", "series/options"),

  // --- Category ---
  getCategoryList: async () =>
    fetchRequest<void, Category[]>("GET", "category/list"),

  getCategoryOptionList: async () =>
    fetchRequest<void, CategoryOption[]>("GET", "category/options"),

  // --- Attr ---
  getAttrList: async () => fetchRequest<void, Attribute[]>("GET", "attr/list"),
  getRoleList: async () => fetchRequest<void, Role[]>("GET", "role/list"),

  getAttrSetList: async () =>
    fetchRequest<void, AttributeSet[]>("GET", "attr-set/list"),
  getAttrSetOptionList: async () =>
    fetchRequest<void, AttrSetOption[]>("GET", "attr-set/options"),

  // --- SKU ---
  getSkuList: async (body: GetSkuRequestBody) =>
    fetchRequest<GetSkuRequestBody, { item: Sku[]; total: number }>(
      "POST",
      "sku/list",
      body
    ),

  createSku: async (body: Omit<Sku, "id">) =>
    fetchRequest<Omit<Sku, "id">, Sku>("POST", "sku/create", body),

  updateSku: (data: Sku) =>
    fetchRequest<Sku, Sku>("PUT", `sku/update/${data.id}`, data),

  deleteSku: (id: string) =>
    fetchRequest<void, void>("DELETE", `sku/delete/${id}`),

  // --- Series ---
  createSeries: (data: Omit<Series, "id" | "childSkuIds">) =>
    fetchRequest<typeof data, Series>("POST", "series/create", data),

  updateSeries: (data: Series) =>
    fetchRequest<Series, Series>("PUT", `series/update/${data.id}`, data),

  deleteSeries: (id: string) =>
    fetchRequest<void, void>("DELETE", `series/delete/${id}`),

  // --- category ---
  createCategory: (data: { name: string; parentId?: string }) =>
    fetchRequest<typeof data, Category>("POST", "category/create", data),

  deleteCategory: (id: string) =>
    fetchRequest<void, void>("DELETE", `category/delete/${id}`),

  // --- attribute ---
  createAttr: (data: { name: string }) =>
    fetchRequest<{ name: string }, Attribute>("POST", "attribute/create", data),

  deleteAttr: (id: string) =>
    fetchRequest<void, void>("DELETE", `attribute/delete/${id}`),

  // --- Attribute Sets ---
  createAttrSet: (data: { name: string }) =>
    fetchRequest<{ name: string }, AttributeSet>(
      "POST",
      "attribute-set/create",
      data
    ),

  updateAttrSet: (id: string, attributeIds: string[]) =>
    fetchRequest<{ attributeIds: string[] }, AttributeSet>(
      "PUT",
      `attribute-set/update/${id}`,
      { attributeIds }
    ),

  deleteAttrSet: (id: string) =>
    fetchRequest<void, void>("DELETE", `attribute-set/delete/${id}`),

  // --- EXTENSIONS (OMS) ---

  // --- EXTENSIONS (project) ---
  getProjectList: () => fetchRequest<void, any[]>("GET", "project/list"),

  createProject: (data: any) =>
    fetchRequest<any, any>("POST", "project/create", data),

  updateProject: (data: any) =>
    fetchRequest<any, any>("PUT", `project/update/${data.id}`, data),

  // --- EXTENSIONS (catalog) ---
  getCatalog: () => fetchRequest<void, any[]>("GET", "catalog/list"),

  saveCatalog: (data: any) =>
    fetchRequest<any, any>("POST", "catalog/save", data),

  deleteCatalogList: (id: string) =>
    fetchRequest<void, void>("DELETE", `catalog/delete/${id}`),

  getUserList: () => fetchRequest<void, any[]>("GET", "user/list"),

  // --- Order Page ---
  getBranchList: () => fetchRequest<void, any[]>("GET", "branch/list"),
  getOrderList: (branchId: string) =>
    fetchRequest<void, Order[]>("GET", `order/list/${branchId}`),
  createOrder: (data: any) =>
    fetchRequest<any, any>("POST", "order/create", data),
  getInventory: (branchId: string) =>
    fetchRequest<void, any>("GET", `inventory/list/${branchId}`),

  getComplaintList: (branchId: string) =>
    fetchRequest<void, Complaint[]>("GET", `complaint/list/${branchId}`),
  getDriverList: (branchId: string) =>
    fetchRequest<void, Driver[]>("GET", `driver/list/${branchId}`),
  getReceiveOrderList: (branchId: string) =>
    fetchRequest<void, Order[]>("GET", `receive-order/list/${branchId}`),
  getTransferList: (branchId: string) =>
    fetchRequest<void, StockTransfer[]>(
      "GET",
      `stock-transfer/list/${branchId}`
    ),

  getChannelList: () => fetchRequest<void, any[]>("GET", "channel/list"),

  getChatList: () => fetchRequest<void, any[]>("GET", "chat/list"),
  getDraftList: () => fetchRequest<void, any[]>("GET", "draft/list"),
  getIdeaList: () => fetchRequest<void, any[]>("GET", "idea/list"),

  getPopList: () => fetchRequest<void, any[]>("GET", "pop/list"),

  getNotificationList: () =>
    fetchRequest<void, any[]>("GET", "notification/list"),
};

async function handleResponse<ResponseBody>(
  response: Response
): Promise<ResponseBody> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch (e) {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function fetchRequest<RequestBody, ResponseBody>(
  method: ApiMethod,
  endpoint: string,
  body?: RequestBody,
  header?: HeadersInit
): Promise<ResponseBody> {
  let response: Response;
  if (APP_CONFIG.useMockData) {
    const fileName = endpoint
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .map((segment) =>
        /[0-9]/.test(segment) || segment.length > 20 ? "[id]" : segment
      )
      .join(".");

    const mockPath = new URL(`./mocks/${fileName}.json`, import.meta.url).href;
    const response = await fetch(mockPath, { cache: "no-cache" });
    return handleResponse<ResponseBody>(response);
  } else {
    let opt: RequestInit = {
      method,
      ...headers,
      ...(body && { body: JSON.stringify(body) }),
      ...(header && { headers: header }),
    };
    response = await fetch(`${BASE_URL}/${endpoint}`, opt);
  }
  return handleResponse<ResponseBody>(response);
}
