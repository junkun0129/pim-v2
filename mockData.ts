
import type { Category, Attribute, AttributeSet, Series, Sku, Branch, Inventory, Order, CustomerOrder, PopTemplate, WebCatalog, User, Project, ChatMessage, BrainstormIdea, Complaint, Driver, StockTransfer, Role, SkuDraft, ExportChannel } from './types';

export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat1', name: '日用品' },
    { id: 'cat2', name: '掃除道具', parentId: 'cat1' },
    { id: 'cat3', name: '水回り', parentId: 'cat2' },
    { id: 'cat4', name: 'エレクトロニクス' },
    { id: 'cat5', name: 'スマートフォン', parentId: 'cat4' },
    { id: 'cat6', name: 'ノートPC', parentId: 'cat4' },
    { id: 'cat7', name: 'タブレット', parentId: 'cat4' },
    { id: 'cat8', name: 'キッチン用品', parentId: 'cat1' },
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
    { id: 'attr9', name: 'カラー' },
];

export const MOCK_ATTRIBUTE_SETS: AttributeSet[] = [
    { id: 'as1', name: 'ディスプレイ仕様', attributeIds: ['attr1', 'attr2'] },
    { id: 'as2', name: 'パフォーマンス', attributeIds: ['attr3', 'attr4'] },
    { id: 'as3', name: 'ノートPC仕様', attributeIds: ['attr5', 'attr6'] },
    { id: 'as4', name: 'スマートウォッチ仕様', attributeIds: ['attr7', 'attr8'] },
    { id: 'as5', name: '基本バリエーション', attributeIds: ['attr9'] },
];

export const MOCK_SERIES: Series[] = [
    { id: 'ser1', name: 'iPhone 14 シリーズ', childSkuIds: ['sku1', 'sku2'], categoryIds: ['cat4', 'cat5'], attributeSetIds: ['as1', 'as2', 'as5'], attributeValues: { 'attr1': '6.1インチ', 'attr2': '2532x1170', 'attr3': 'A15 Bionic', 'attr4': '6GB' }, imageUrl: 'https://placehold.co/400x400/94a3b8/ffffff?text=iPhone+14', assets: [] },
    { id: 'ser2', name: 'MacBook Pro 14インチ', childSkuIds: ['sku3'], categoryIds: ['cat4', 'cat6'], attributeSetIds: ['as3', 'as5'], attributeValues: { 'attr5': 'M2 Pro', 'attr6': '512GB SSD'}, imageUrl: 'https://placehold.co/400x400/94a3b8/ffffff?text=MacBook', assets: [] },
    { id: 'ser3', name: 'Pixel 7 シリーズ', childSkuIds: [], categoryIds: ['cat4', 'cat5'], attributeSetIds: ['as1', 'as2', 'as5'], attributeValues: {'attr3': 'Google Tensor G2'}, imageUrl: 'https://placehold.co/400x400/334155/ffffff?text=Pixel+7', assets: [] },
    { id: 'ser4', name: '激落ちくんシリーズ', childSkuIds: [], categoryIds: ['cat1', 'cat2', 'cat3'], attributeSetIds: [], attributeValues: {}, imageUrl: 'https://placehold.co/400x400/e2e8f0/64748b?text=Cleaners', assets: [] },
    { id: 'ser5', name: 'iPad Air (第5世代)', childSkuIds: [], categoryIds: ['cat4', 'cat7'], attributeSetIds: ['as1', 'as2', 'as5'], attributeValues: {'attr3': 'M1'}, imageUrl: 'https://placehold.co/400x400/a78bfa/ffffff?text=iPad+Air', assets: [] },
];

// Generate base SKUs
const baseSkus: Sku[] = [
    { 
        id: 'sku1', 
        name: 'iPhone 14 Pro SpaceBlack', 
        skuId: 'IP14P-128-BLK', 
        barcode: '4549995359787',
        price: 149800, 
        seriesId: 'ser1', 
        categoryIds: ['cat4', 'cat5'], 
        attributeSetIds: [], 
        attributeValues: { 'attr9': 'Space Black', 'attr6': '128GB' }, 
        imageUrl: 'https://placehold.co/400x400/111827/ffffff?text=iPhone+14+Pro+BLK',
        assets: [
            { id: 'a1', type: 'IMAGE', name: 'Main Product Image', url: 'https://placehold.co/400x400/111827/ffffff?text=iPhone+14+Pro+BLK', createdAt: '2023-10-01' },
            { id: 'a2', type: 'VIDEO', name: 'Product Reveal Teaser', url: 'https://www.w3schools.com/html/mov_bbb.mp4', createdAt: '2023-10-02', size: '15 MB' },
            { id: 'a3', type: 'FILE', name: 'Spec_Sheet_v2.pdf', url: '#', createdAt: '2023-10-03', size: '2.4 MB' }
        ]
    },
    { id: 'sku2', name: 'iPhone 14 Blue', skuId: 'IP14-128-BLU', barcode: '4549995361234', price: 119800, seriesId: 'ser1', categoryIds: ['cat4', 'cat5'], attributeSetIds: [], attributeValues: { 'attr9': 'Blue', 'attr6': '128GB' }, assets: [] },
    { id: 'sku3', name: 'MacBook Pro 14" M2 Pro SpaceGray', skuId: 'MBP14-M2P-512', barcode: '4549995365678', price: 288800, seriesId: 'ser2', categoryIds: ['cat4', 'cat6'], attributeSetIds: [], attributeValues: { 'attr9': 'Space Gray' }, assets: [] },
    { id: 'sku4', name: '激落ちくん スポンジ', skuId: 'GEKI-001', barcode: '4903320579123', price: 380, seriesId: 'ser4', categoryIds: ['cat1', 'cat2', 'cat3'], attributeSetIds: [], attributeValues: {}, imageUrl: 'https://placehold.co/400x400/ffffff/000000?text=Sponge', assets: [] },
];

// Helper to generate bulk SKUs for pagination demo
const generateBulkSkus = (): Sku[] => {
    const bulk: Sku[] = [];
    
    // Pixel 7 Variations (10 items)
    const pxColors = ['Obsidian', 'Snow', 'Lemongrass', 'Hazel', 'Coral'];
    const pxStorage = ['128GB', '256GB'];
    pxColors.forEach((color, i) => {
        pxStorage.forEach((storage, j) => {
            bulk.push({
                id: `sku_px_${i}_${j}`,
                name: `Pixel 7 ${color} ${storage}`,
                skuId: `PXL7-${storage}-${color.substring(0,3).toUpperCase()}`,
                barcode: `490000000001${i}${j}`,
                price: storage === '128GB' ? 82500 : 97900,
                seriesId: 'ser3',
                categoryIds: ['cat4', 'cat5'],
                attributeSetIds: [],
                attributeValues: { 'attr9': color, 'attr6': storage },
                imageUrl: `https://placehold.co/400x400/334155/ffffff?text=Pixel+7+${color}`
            });
        });
    });

    // iPad Air Variations (15 items)
    const padColors = ['Space Gray', 'Starlight', 'Pink', 'Purple', 'Blue'];
    const padStorage = ['64GB', '256GB', '512GB'];
    padColors.forEach((color, i) => {
        padStorage.forEach((storage, j) => {
            bulk.push({
                id: `sku_pad_${i}_${j}`,
                name: `iPad Air Wi-Fi ${storage} ${color}`,
                skuId: `IPDA5-${storage.replace('GB','')}-${color.substring(0,3).toUpperCase()}`,
                barcode: `490000000002${i}${j}`,
                price: 92800 + (j * 20000),
                seriesId: 'ser5',
                categoryIds: ['cat4', 'cat7'],
                attributeSetIds: [],
                attributeValues: { 'attr9': color, 'attr6': storage },
                imageUrl: `https://placehold.co/400x400/a78bfa/ffffff?text=iPad+Air+${color}`
            });
        });
    });

    // Cleaning Supplies (30 items)
    for(let i=1; i<=30; i++) {
        const type = i % 3 === 0 ? 'スプレー' : i % 2 === 0 ? 'シート' : 'スポンジ';
        bulk.push({
            id: `sku_cln_${i}`,
            name: `激落ちくん ${type} Type-${i}`,
            skuId: `GEKI-${type === 'スプレー' ? 'SPR' : type === 'シート' ? 'SHT' : 'SPG'}-${100+i}`,
            barcode: `4903320579${130+i}`,
            price: 350 + (i * 10),
            seriesId: 'ser4',
            categoryIds: ['cat1', 'cat2', 'cat3'],
            attributeSetIds: [],
            attributeValues: { 'attr1': type === 'シート' ? `${i*5}枚入り` : '通常サイズ' },
            imageUrl: 'https://placehold.co/400x400/f1f5f9/475569?text=Clean'
        });
    }

    // Kitchen Supplies (10 items)
    for(let i=1; i<=10; i++) {
        bulk.push({
            id: `sku_kit_${i}`,
            name: `プレミアム・キッチンペーパー ${i*2}ロール`,
            skuId: `KIT-PPR-${200+i}`,
            barcode: `490000000004${i}`,
            price: 298 * i,
            categoryIds: ['cat1', 'cat8'],
            attributeSetIds: [],
            attributeValues: {},
            imageUrl: 'https://placehold.co/400x400/fff7ed/9a3412?text=Paper'
        });
    }

    return bulk;
};

export const MOCK_SKUS: Sku[] = [...baseSkus, ...generateBulkSkus()];

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
    { id: 'ord2', branchId: 'br2', skuId: 'sku1', quantity: 50, status: 'SHIPPED', orderDate: '2023-10-24', driverId: 'drv1' },
    { id: 'ord3', branchId: 'br2', skuId: 'sku2', quantity: 20, status: 'PENDING', orderDate: '2023-10-26' },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
    { id: 'co1', customerName: '山田 太郎', skuId: 'sku1', quantity: 1, totalPrice: 149800, orderDate: '2023-10-26 14:30', status: 'SHIPPED' },
    { id: 'co2', customerName: '鈴木 花子', skuId: 'sku4', quantity: 5, totalPrice: 1900, orderDate: '2023-10-26 15:45', status: 'PROCESSING' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
    { id: 'comp1', branchId: 'br1', title: '配送遅延について', content: '昨日到着予定の荷物がまだ届いていません。', status: 'OPEN', createdAt: '2023-10-26' },
    { id: 'comp2', branchId: 'br3', title: '破損報告', content: '到着したSKU-001の箱が潰れていました。交換をお願いします。', status: 'RESOLVED', createdAt: '2023-10-20', response: '代替品を発送しました。' },
];

export const MOCK_DRIVERS: Driver[] = [
    { id: 'drv1', name: '佐藤 運送', phone: '090-1111-2222', status: 'BUSY', currentLocation: '大阪市内配送中' },
    { id: 'drv2', name: '鈴木 急便', phone: '090-3333-4444', status: 'AVAILABLE', currentLocation: '東京営業所待機' },
];

export const MOCK_TRANSFERS: StockTransfer[] = [
    { id: 'tr1', fromBranchId: 'br1', toBranchId: 'br2', skuId: 'sku1', quantity: 5, status: 'COMPLETED', date: '2023-10-25' },
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

// --- Project / Collaboration Mock Data ---

export const MOCK_ROLES: Role[] = [
    { 
        id: 'role_admin', 
        name: 'システム管理者', 
        description: 'すべての機能にアクセスできます。',
        permissions: [
            'MASTER_VIEW', 'MASTER_CREATE', 'MASTER_EDIT', 'MASTER_DELETE', 'MASTER_IMPORT', 'MASTER_EXPORT',
            'OMS_VIEW', 'OMS_ORDER_CREATE',
            'EC_VIEW', 'EC_MANAGE',
            'CREATIVE_VIEW', 'CREATIVE_EDIT',
            'CATALOG_VIEW', 'CATALOG_EDIT',
            'PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_EDIT',
            'ADMIN_VIEW', 'ADMIN_MANAGE'
        ] 
    },
    { 
        id: 'role_manager', 
        name: '商品マネージャー', 
        description: 'マスタ管理とプロジェクト管理が可能です。',
        permissions: [
            'MASTER_VIEW', 'MASTER_CREATE', 'MASTER_EDIT', 'MASTER_DELETE', 'MASTER_IMPORT', 'MASTER_EXPORT',
            'PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_EDIT',
            'CATALOG_VIEW', 'CATALOG_EDIT'
        ] 
    },
    { 
        id: 'role_staff', 
        name: '店舗スタッフ', 
        description: '在庫確認、発注、POP作成のみ可能です。プロジェクトは閲覧のみ。',
        permissions: [
            'OMS_VIEW', 'OMS_ORDER_CREATE',
            'EC_VIEW',
            'CREATIVE_VIEW', 'CREATIVE_EDIT',
            'PROJECT_VIEW'
        ] 
    },
    {
        id: 'role_creator',
        name: 'コンテンツクリエイター',
        description: 'WebカタログとPOP作成に特化。プロジェクトで起案可能。',
        permissions: [
            'MASTER_VIEW',
            'CATALOG_VIEW', 'CATALOG_EDIT',
            'CREATIVE_VIEW', 'CREATIVE_EDIT',
            'PROJECT_VIEW', 'PROJECT_CREATE'
        ] 
    }
];

export const MOCK_USERS: User[] = [
    { id: 'user1', name: '自分 (Admin)', avatarUrl: 'https://placehold.co/100/3b82f6/ffffff?text=ME', roleId: 'role_admin' },
    { id: 'user2', name: '田中 健 (Manager)', avatarUrl: 'https://placehold.co/100/10b981/ffffff?text=TK', roleId: 'role_manager' },
    { id: 'user3', name: '佐藤 愛 (Creator)', avatarUrl: 'https://placehold.co/100/f59e0b/ffffff?text=AS', roleId: 'role_creator' },
    { id: 'user4', name: '鈴木 一郎 (Staff)', avatarUrl: 'https://placehold.co/100/6366f1/ffffff?text=IS', roleId: 'role_staff' },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj1',
        name: '2024 春の新製品開発',
        description: '来春リリース予定のサステナブル掃除用品シリーズの企画・開発',
        status: 'IN_PROGRESS',
        memberIds: ['user1', 'user2', 'user3'],
        createdAt: '2023-11-01',
        dueDate: '2024-02-28'
    },
    {
        id: 'proj2',
        name: '家電ラインナップ刷新',
        description: '既存の白物家電のリブランディング',
        status: 'PLANNING',
        memberIds: ['user1', 'user2'],
        createdAt: '2023-11-10'
    }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    { id: 'msg1', projectId: 'proj1', userId: 'user2', content: '新しいスポンジの素材についてアイデアがあります！', timestamp: '2023-11-12 10:00' },
    { id: 'msg2', projectId: 'proj1', userId: 'user1', content: 'お、いいですね。ブレストボードに貼っておいてください。', timestamp: '2023-11-12 10:05' },
    { id: 'msg3', projectId: 'proj1', userId: 'user3', content: 'パッケージデザインのラフもできたので共有します。', timestamp: '2023-11-12 11:30' },
];

export const MOCK_IDEAS: BrainstormIdea[] = [
    { id: 'idea1', projectId: 'proj1', userId: 'user2', content: '竹繊維を使った生分解性スポンジ', color: 'green', votes: 2, attachments: [] },
    { id: 'idea2', projectId: 'proj1', userId: 'user3', content: '詰め替え可能なボトルデザイン', color: 'blue', votes: 1, attachments: [] },
    { id: 'idea3', projectId: 'proj1', userId: 'user1', content: 'お試しセット（3種入り）', color: 'yellow', votes: 3, attachments: [] },
    { id: 'idea4', projectId: 'proj1', userId: 'user2', content: 'サブスクリプション販売モデル', color: 'pink', votes: 0, attachments: [] },
];

export const MOCK_DRAFTS: SkuDraft[] = [
    { 
        id: 'draft1', 
        projectId: 'proj1', 
        name: '竹炭スポンジ (仮)', 
        proposedSkuId: 'BAMBOO-001', 
        price: 450, 
        description: '抗菌作用のある竹炭を練り込んだプレミアムスポンジ。パッケージは紙製にしてプラ削減。', 
        status: 'PROPOSAL', 
        authorId: 'user2', 
        createdAt: '2023-11-15',
        linkedIdeaId: 'idea1'
    },
    { 
        id: 'draft2', 
        projectId: 'proj1', 
        name: '詰め替えボトル 500ml', 
        proposedSkuId: 'BOTTLE-RE-500', 
        price: 800, 
        description: 'シンプルで長く使えるデザインボトル。', 
        status: 'APPROVED', 
        authorId: 'user3', 
        createdAt: '2023-11-16' 
    },
];

export const MOCK_EXPORT_CHANNELS: ExportChannel[] = [
    {
        id: 'ch_amazon',
        name: 'Amazon JP',
        fileFormat: 'CSV',
        columns: [
            { id: 'c1', headerName: 'external_product_id', sourceField: 'barcode', defaultValue: '' },
            { id: 'c2', headerName: 'item_name', sourceField: 'name', defaultValue: '' },
            { id: 'c3', headerName: 'standard_price', sourceField: 'price', defaultValue: '' },
            { id: 'c4', headerName: 'brand_name', sourceField: 'seriesId', defaultValue: 'Generic' },
        ],
        lastExported: '2023-11-20 14:00'
    },
    {
        id: 'ch_rakuten',
        name: '楽天市場 (CSV)',
        fileFormat: 'CSV',
        columns: [
            { id: 'c1', headerName: '商品管理番号', sourceField: 'skuId', defaultValue: '' },
            { id: 'c2', headerName: '商品名', sourceField: 'name', defaultValue: '' },
            { id: 'c3', headerName: '販売価格', sourceField: 'price', defaultValue: '' },
            { id: 'c4', headerName: 'PC用商品説明文', sourceField: 'name', defaultValue: '' },
        ],
        lastExported: '2023-11-18 09:30'
    }
];
