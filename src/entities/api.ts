import { APP_CONFIG } from "../config";
import { Attribute } from "./attr/type";
import { AttributeSet } from "./attrset/type";
import { Category } from "./category/types";
import { Role } from "./role/types";
import { Series } from "./series/types";
import { GetSkuRequestBody, Sku } from "./sku/types";

const BASE_URL = APP_CONFIG.apiBaseUrl;

const headers = {
  "Content-Type": "application/json",
};

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const api = {
  getSkuList: async (body: GetSkuRequestBody) =>
    fetchRequest<GetSkuRequestBody, { item: Sku[]; total: number }>(
      "POST",
      "sku/list",
      body
    ),

  getSeriesList: async () => fetchRequest<void, Series[]>("GET", "series/list"),

  getCategoryList: async () =>
    fetchRequest<void, Category[]>("GET", "category/list"),

  getAttrList: async () => fetchRequest<void, Attribute[]>("GET", "attr/list"),
  getRoleList: async () => fetchRequest<void, Role[]>("GET", "role/list"),

  getAttrSetList: async () =>
    fetchRequest<void, AttributeSet[]>("GET", "attr-set/list"),

  createSku: async (body: Omit<Sku, "id">) =>
    fetchRequest<Omit<Sku, "id">, Sku>("POST", "sku/create", body),

  // --- SKU ---
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
  getOrderList: () => fetchRequest<void, any[]>("GET", "order/list"),

  createOrder: (data: any) =>
    fetchRequest<any, any>("POST", "order/create", data),

  getInventory: () => fetchRequest<void, any>("GET", "inventory/list"),

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

  // --- EXTENSIONS (System) ---
  getUserList: () => fetchRequest<void, any[]>("GET", "user/list"),
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
