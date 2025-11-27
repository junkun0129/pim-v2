
import { Sku, Series, Category, Attribute, AttributeSet } from './types';
import { APP_CONFIG } from './config';

const BASE_URL = APP_CONFIG.apiBaseUrl;

const headers = {
    'Content-Type': 'application/json',
};

async function handleResponse(response: Response) {
    if (!response.ok) {
        // Try to parse the error message from the backend JSON body
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.json();
            if (errorBody && errorBody.error) {
                errorMessage = errorBody.error;
            }
        } catch (e) {
            // If response isn't JSON, fall back to text
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
        // NOTE: You need to implement a POST /upload endpoint in your API Gateway/Lambda
        // that handles the S3 upload and returns { imageUrl: "https://..." }
        const formData = new FormData();
        formData.append('file', file);
        
        // We do not set 'Content-Type': 'application/json' here because 
        // the browser sets the correct multipart/form-data boundary automatically.
        const response = await fetch(`${BASE_URL}/upload`, { 
            method: 'POST', 
            body: formData 
        });
        
        const data = await handleResponse(response);
        return data.imageUrl;
    },

    // --- SKU ---
    createSku: (data: Omit<Sku, 'id'>) => 
        fetch(`${BASE_URL}/skus`, { method: 'POST', headers, body: JSON.stringify(data) }).then(handleResponse),
    
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
};
