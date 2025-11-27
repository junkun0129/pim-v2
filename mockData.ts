
import type { Category, Attribute, AttributeSet, Series, Sku, Branch, Inventory, Order, CustomerOrder, PopTemplate, WebCatalog } from './types';

export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat1', name: '日用品' },
    { id: 'cat2', name: '掃除道具', parentId: 'cat1' },
    { id: 'cat3', name: '水回り', parentId: 'cat2' },
    { id: 'cat4', name: 'エレクトロニクス' },
    { id: 'cat5', name: 'スマートフォン', parentId: 'cat4' },
    { id: 'cat6', name: 'ノートPC', parentId: 'cat4' },
];

export const MOCK_ATTRIBUTES: Attribute[] = [
    { id: 'attr1', name: 'サイズ' },
    { id: 'attr2', name: '解像度' },
    { id: 'attr3', name: 'チップ' },
    { id: 'attr4', name: 'RAM' },
    { id: 'attr5', name: 'CPU' },
    { id: 'attr6', name: 'ストレージ' },
    { id: 'attr7', name: 'ケースサイズ' },
    { id: 'attr8', name: '素材' },
];

export const MOCK_ATTRIBUTE_SETS: AttributeSet[] = [
    { id: 'as1', name: 'ディスプレイ仕様', attributeIds: ['attr1', 'attr2'] },
    { id: 'as2', name: 'パフォーマンス', attributeIds: ['attr3', 'attr4'] },
    { id: 'as3', name: 'ノートPC仕様', attributeIds: ['attr5', 'attr6'] },
    { id: 'as4', name: 'スマートウォッチ仕様', attributeIds: ['attr7', 'attr8'] },
];

export const MOCK_SERIES: Series[] = [
    { id: 'ser1', name: 'iPhone 14 シリーズ', childSkuIds: ['sku1', 'sku2'], categoryIds: ['cat4', 'cat5'], attributeSetIds: ['as1', 'as2'], attributeValues: { 'attr1': '6.1インチ', 'attr2': '2532x1170', 'attr3': 'A15 Bionic', 'attr4': '6GB' }, imageUrl: 'https://placehold.co/400x400/94a3b8/ffffff?text=iPhone+14', assets: [] },
    { id: 'ser2', name: 'MacBook Pro 14インチ', childSkuIds: ['sku3'], categoryIds: ['cat4', 'cat6'], attributeSetIds: ['as3'], attributeValues: { 'attr5': 'M2 Pro', 'attr6': '512GB SSD'}, imageUrl: 'https://placehold.co/400x400/94a3b8/ffffff?text=MacBook', assets: [] },
];

export const MOCK_SKUS: Sku[] = [
    { 
        id: 'sku1', 
        name: 'iPhone 14 Pro', 
        skuId: 'IP14P-128-BLK', 
        barcode: '4549995359787',
        price: 149800, 
        seriesId: 'ser1', 
        categoryIds: ['cat4', 'cat5'], 
        attributeSetIds: [], 
        attributeValues: {}, 
        imageUrl: 'https://placehold.co/400x400/334155/ffffff?text=iPhone+14+Pro',
        assets: [
            { id: 'a1', type: 'IMAGE', name: 'Main Product Image', url: 'https://placehold.co/400x400/334155/ffffff?text=iPhone+14+Pro', createdAt: '2023-10-01' }
        ]
    },
    { id: 'sku2', name: 'iPhone 14', skuId: 'IP14-128-BLU', barcode: '4549995361234', price: 119800, seriesId: 'ser1', categoryIds: ['cat4', 'cat5'], attributeSetIds: [], attributeValues: {}, assets: [] },
    { id: 'sku3', name: 'MacBook Pro 14" M2 Pro', skuId: 'MBP14-M2P-512', barcode: '4549995365678', price: 288800, seriesId: 'ser2', categoryIds: ['cat4', 'cat6'], attributeSetIds: [], attributeValues: {}, assets: [] },
    { id: 'sku4', name: '激落ちくん', skuId: 'GEKI-001', barcode: '4903320579123', price: 380, categoryIds: ['cat1', 'cat2', 'cat3'], attributeSetIds: [], attributeValues: {}, imageUrl: 'https://placehold.co/400x400/334155/ffffff?text=Cleaner', assets: [] },
];

// --- New Mock Data for Order System ---

export const MOCK_BRANCHES: Branch[] = [
    { id: 'br1', name: '渋谷本店', location: '東京都渋谷区', type: 'RETAIL' },
    { id: 'br2', name: '大阪梅田店', location: '大阪府大阪市', type: 'RETAIL' },
    { id: 'br3', name: '福岡天神店', location: '福岡県福岡市', type: 'RETAIL' },
    { id: 'br-ec', name: '公式オンラインストア', location: '千葉物流センター', type: 'EC' },
];

export const MOCK_INVENTORY: Inventory[] = [
    { skuId: 'sku1', branchId: 'br1', quantity: 45, lastUpdated: '2023-10-25' }, // Shibuya has many iPhones
    { skuId: 'sku2', branchId: 'br1', quantity: 12, lastUpdated: '2023-10-24' },
    { skuId: 'sku4', branchId: 'br1', quantity: 150, lastUpdated: '2023-10-20' }, // Lots of cleaners
    { skuId: 'sku1', branchId: 'br2', quantity: 5, lastUpdated: '2023-10-25' },  // Osaka is running low
    { skuId: 'sku3', branchId: 'br3', quantity: 8, lastUpdated: '2023-10-21' },
    
    // EC Inventory
    { skuId: 'sku1', branchId: 'br-ec', quantity: 200, lastUpdated: '2023-10-26' },
    { skuId: 'sku3', branchId: 'br-ec', quantity: 50, lastUpdated: '2023-10-26' },
    { skuId: 'sku4', branchId: 'br-ec', quantity: 500, lastUpdated: '2023-10-26' },
];

export const MOCK_ORDERS: Order[] = [
    { id: 'ord1', branchId: 'br1', skuId: 'sku3', quantity: 10, status: 'RECEIVED', orderDate: '2023-10-01' },
    { id: 'ord2', branchId: 'br2', skuId: 'sku1', quantity: 50, status: 'SHIPPED', orderDate: '2023-10-24' },
    { id: 'ord3', branchId: 'br2', skuId: 'sku2', quantity: 20, status: 'PENDING', orderDate: '2023-10-26' },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
    { id: 'co1', customerName: '山田 太郎', skuId: 'sku1', quantity: 1, totalPrice: 149800, orderDate: '2023-10-26 14:30', status: 'SHIPPED' },
    { id: 'co2', customerName: '鈴木 花子', skuId: 'sku4', quantity: 5, totalPrice: 1900, orderDate: '2023-10-26 15:45', status: 'PROCESSING' },
];

export const MOCK_POP_TEMPLATES: PopTemplate[] = [
    {
        id: 'tmpl1',
        name: 'スタンダード',
        description: 'シンプルで見やすい基本レイアウト',
        backgroundColor: '#ffffff',
        elements: [
            { type: 'RECT', x: 20, y: 20, width: 560, height: 360, fill: 'transparent', isSkuImage: false }, // Border placeholder (handled by stroke)
            { type: 'TEXT', x: 40, y: 40, width: 500, height: 40, fill: '#1e293b', fontSize: 36, fontWeight: 'bold', isSkuName: true },
            { type: 'IMAGE', x: 40, y: 100, width: 200, height: 200, fill: '#000', isSkuImage: true },
            { type: 'TEXT', x: 260, y: 120, width: 300, height: 100, fill: '#dc2626', fontSize: 80, fontWeight: 'bold', isSkuPrice: true },
            { type: 'TEXT', x: 270, y: 220, width: 300, height: 40, fill: '#64748b', fontSize: 24, fontWeight: 'normal', text: '税込価格' },
            { type: 'TEXT', x: 40, y: 320, width: 300, height: 40, fill: '#000', fontSize: 20, fontWeight: 'normal', isSkuBarcode: true },
        ]
    },
    {
        id: 'tmpl2',
        name: '大特価セール',
        description: '黄色い背景で目立つセール用デザイン',
        backgroundColor: '#fef9c3', // Yellow-100
        elements: [
            { type: 'RECT', x: 0, y: 0, width: 600, height: 100, fill: '#ef4444' }, // Red Header
            { type: 'TEXT', x: 220, y: 20, width: 200, height: 60, fill: '#ffffff', fontSize: 48, fontWeight: 'bold', text: 'SALE' },
            { type: 'TEXT', x: 30, y: 120, width: 540, height: 40, fill: '#000000', fontSize: 28, fontWeight: 'bold', isSkuName: true },
            { type: 'CIRCLE', x: 380, y: 180, width: 200, height: 200, fill: '#dc2626' }, // Price Circle
            { type: 'TEXT', x: 410, y: 250, width: 150, height: 60, fill: '#ffffff', fontSize: 56, fontWeight: 'bold', isSkuPrice: true },
             { type: 'IMAGE', x: 30, y: 180, width: 200, height: 200, fill: '#000', isSkuImage: true },
        ]
    },
    {
        id: 'tmpl3',
        name: '黒板風おすすめ',
        description: '手書き風フォントが似合うおしゃれなデザイン',
        backgroundColor: '#1f2937', // Gray-800
        elements: [
            { type: 'RECT', x: 10, y: 10, width: 580, height: 380, fill: 'transparent' }, // Border
            { type: 'TEXT', x: 30, y: 30, width: 200, height: 40, fill: '#fcd34d', fontSize: 24, fontWeight: 'normal', text: '店長のおすすめ' },
            { type: 'TEXT', x: 30, y: 80, width: 540, height: 50, fill: '#ffffff', fontSize: 40, fontWeight: 'bold', isSkuName: true },
            { type: 'TEXT', x: 350, y: 300, width: 200, height: 60, fill: '#fcd34d', fontSize: 64, fontWeight: 'bold', isSkuPrice: true },
             { type: 'IMAGE', x: 30, y: 160, width: 220, height: 220, fill: '#000', isSkuImage: true },
        ]
    }
];

export const MOCK_CATALOGS: WebCatalog[] = [
    {
        id: 'cat-web-1',
        name: '新生活応援フェア',
        description: '春の新生活に向けたおすすめ家電・日用品特集',
        themeColor: '#10b981', // Emerald
        status: 'PUBLISHED',
        lastUpdated: '2023-11-01',
        sections: [
            { id: 'sec1', type: 'HERO', title: 'Start New Life', subtitle: '新しい生活、新しい道具と。', imageUrl: 'https://placehold.co/1200x400/10b981/ffffff?text=New+Life+Fair' },
            { id: 'sec2', type: 'GRID_CATEGORY', title: '掃除道具コレクション', targetId: 'cat2' },
            { id: 'sec3', type: 'SPOTLIGHT_SKU', title: '今月のピックアップ', targetId: 'sku1' },
        ]
    },
    {
        id: 'cat-web-2',
        name: 'Apple製品特集',
        description: '最新のiPhone, Macをご紹介',
        themeColor: '#111827', // Gray-900
        status: 'DRAFT',
        lastUpdated: '2023-11-05',
        sections: [
            { id: 'sec1', type: 'HERO', title: 'Designed by Apple', subtitle: '革新的なテクノロジーをあなたの手に。', imageUrl: 'https://placehold.co/1200x400/111827/ffffff?text=Apple+Special' },
            { id: 'sec2', type: 'GRID_CATEGORY', title: 'スマートフォン', targetId: 'cat5' },
        ]
    }
];
