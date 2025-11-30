import { Sku, Series, Category, Attribute, AttributeSet } from './types';
import { APP_CONFIG } from './config';

const BASE_URL = APP_CONFIG.apiBaseUrl;

const headers = {
    'Content-Type': 'application/json',
};

async function handleResponse(response: Response) {
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

export const api = {
    // --- Initial Load ---
    fetchAllData: async () => {
        const [skus, series, categories, attributes, attributeSets] = await Promise.all([
            fetch(`${BASE_URL}/skus`, { headers }).then(handleResponse),
            fetch(`${BASE_URL}/series`, { headers }).then(handleResponse),
            fetch(`${BASE_URL}/categories`, { headers }).then(handleResponse),
            fetch(`${BASE_URL}/attributes`, { headers }).then(handleResponse),
            fetch(`${BASE_URL}/attribute-sets`, { headers }).then(handleResponse),
        ]);
        return { skus, series, categories, attributes, attributeSets };
    },

    // --- Images (S3 Upload) ---
    uploadImage: async (file: File): Promise<string> => {
        // 1. Get Presigned URL
        const presignResponse = await fetch(`${BASE_URL}/upload`, { 
            method: 'POST', 
            headers,
            body: JSON.stringify({ fileName: file.name, fileType: file.type }) 
        });
        const { uploadUrl, imageUrl } = await handleResponse(presignResponse);

        // 2. Upload directly to S3
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
        });

        return imageUrl;
    },

    // --- SKU ---
    createSku: (data: Omit<Sku, 'id'>) => 
        fetch(`${BASE_URL}/skus`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    updateSku: (data: Sku) => 
        fetch(`${BASE_URL}/skus/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse),

    deleteSku: (id: string) => 
        fetch(`${BASE_URL}/skus/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- Series ---
    createSeries: (data: Omit<Series, 'id' | 'childSkuIds'>) => 
        fetch(`${BASE_URL}/series`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    updateSeries: (data: Series) => 
        fetch(`${BASE_URL}/series/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    deleteSeries: (id: string) => 
        fetch(`${BASE_URL}/series/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- Categories ---
    createCategory: (data: { name: string; parentId?: string }) => 
        fetch(`${BASE_URL}/categories`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    deleteCategory: (id: string) => 
        fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- Attributes ---
    createAttribute: (data: { name: string }) => 
        fetch(`${BASE_URL}/attributes`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    deleteAttribute: (id: string) => 
        fetch(`${BASE_URL}/attributes/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- Attribute Sets ---
    createAttributeSet: (data: { name: string }) => 
        fetch(`${BASE_URL}/attribute-sets`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    updateAttributeSet: (id: string, attributeIds: string[]) => 
        fetch(`${BASE_URL}/attribute-sets/${id}`, { method: 'PUT', headers, body: JSON.stringify({ attributeIds }) }).then(handleResponse),
    
    deleteAttributeSet: (id: string) => 
        fetch(`${BASE_URL}/attribute-sets/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- EXTENSIONS (OMS) ---
    fetchOrders: () => fetch(`${BASE_URL}/orders`, { headers }).then(handleResponse),
    createOrder: (data: any) => fetch(`${BASE_URL}/orders`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
    fetchInventory: () => fetch(`${BASE_URL}/inventory`, { headers }).then(handleResponse),
    
    // --- EXTENSIONS (Projects) ---
    fetchProjects: () => fetch(`${BASE_URL}/projects`, { headers }).then(handleResponse),
    createProject: (data: any) => fetch(`${BASE_URL}/projects`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    updateProject: (data: any) => fetch(`${BASE_URL}/projects/${data.id}`, { method: 'PUT', headers, body: JSON.stringify(data) }).then(handleResponse),

    // --- EXTENSIONS (Catalogs) ---
    fetchCatalogs: () => fetch(`${BASE_URL}/catalogs`, { headers }).then(handleResponse),
    saveCatalog: (data: any) => fetch(`${BASE_URL}/catalogs`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse), // Use POST for new/update simplicity or split
    deleteCatalog: (id: string) => fetch(`${BASE_URL}/catalogs/${id}`, { method: 'DELETE', headers }).then(handleResponse),

    // --- EXTENSIONS (System) ---
    fetchUsers: () => fetch(`${BASE_URL}/users`, { headers }).then(handleResponse),
};