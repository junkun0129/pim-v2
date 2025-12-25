import type {
  Branch,
  CustomerOrder,
  PopTemplate,
  ChatMessage,
  BrainstormIdea,
  Complaint,
  Driver,
  StockTransfer,
  Role,
  SkuDraft,
  ExportChannel,
  ExtensionMetadata,
  AppNotification,
} from "./types";
import { ICONS } from "./constants";

export const MOCK_BRANCHES: Branch[] = [
  { id: "br1", name: "渋谷本店", location: "東京都渋谷区", type: "RETAIL" },
  { id: "br2", name: "大阪梅田店", location: "大阪府大阪市", type: "RETAIL" },
  { id: "br3", name: "福岡天神店", location: "福岡県福岡市", type: "RETAIL" },
  {
    id: "br-ec",
    name: "公式オンラインストア",
    location: "千葉物流センター",
    type: "EC",
  },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "co1",
    customerName: "山田 太郎",
    skuId: "sku1",
    quantity: 1,
    totalPrice: 149800,
    orderDate: "2023-10-26 14:30",
    status: "SHIPPED",
  },
  {
    id: "co2",
    customerName: "鈴木 花子",
    skuId: "sku4",
    quantity: 5,
    totalPrice: 1900,
    orderDate: "2023-10-26 15:45",
    status: "PROCESSING",
  },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "comp1",
    branchId: "br1",
    title: "配送遅延について",
    content: "昨日到着予定の荷物がまだ届いていません。",
    status: "OPEN",
    createdAt: "2023-10-26",
  },
  {
    id: "comp2",
    branchId: "br3",
    title: "破損報告",
    content: "到着したSKU-001の箱が潰れていました。交換をお願いします。",
    status: "RESOLVED",
    createdAt: "2023-10-20",
    response: "代替品を発送しました。",
  },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "drv1",
    name: "佐藤 運送",
    phone: "090-1111-2222",
    status: "BUSY",
    currentLocation: "大阪市内配送中",
  },
  {
    id: "drv2",
    name: "鈴木 急便",
    phone: "090-3333-4444",
    status: "AVAILABLE",
    currentLocation: "東京営業所待機",
  },
];

export const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: "tr1",
    fromBranchId: "br1",
    toBranchId: "br2",
    skuId: "sku1",
    quantity: 5,
    status: "COMPLETED",
    date: "2023-10-25",
  },
];

export const MOCK_POP_TEMPLATES: PopTemplate[] = [
  {
    id: "tmpl1",
    name: "スタンダード (A4横)",
    description: "シンプルで見やすい基本レイアウト",
    width: 800,
    height: 565,
    backgroundColor: "#ffffff",
    elements: [
      {
        type: "RECT",
        x: 20,
        y: 20,
        width: 760,
        height: 525,
        fill: "transparent",
        isSkuImage: false,
      }, // Border placeholder (handled by stroke)
      {
        type: "TEXT",
        x: 40,
        y: 40,
        width: 500,
        height: 40,
        fill: "#1e293b",
        fontSize: 36,
        fontWeight: "bold",
        isSkuName: true,
        fontFamily: "sans-serif",
      },
      {
        type: "IMAGE",
        x: 40,
        y: 100,
        width: 200,
        height: 200,
        fill: "#000",
        isSkuImage: true,
      },
      {
        type: "TEXT",
        x: 260,
        y: 120,
        width: 300,
        height: 100,
        fill: "#dc2626",
        fontSize: 80,
        fontWeight: "bold",
        isSkuPrice: true,
        fontFamily: '"RocknRoll One", sans-serif',
      },
      {
        type: "TEXT",
        x: 270,
        y: 220,
        width: 300,
        height: 40,
        fill: "#64748b",
        fontSize: 24,
        fontWeight: "normal",
        text: "税込価格",
        fontFamily: "sans-serif",
      },
      {
        type: "TEXT",
        x: 40,
        y: 320,
        width: 300,
        height: 40,
        fill: "#000",
        fontSize: 20,
        fontWeight: "normal",
        isSkuBarcode: true,
      },
    ],
  },
  {
    id: "tmpl2",
    name: "大特価セール (正方形)",
    description: "黄色い背景で目立つセール用デザイン",
    width: 600,
    height: 600,
    backgroundColor: "#fef9c3", // Yellow-100
    elements: [
      { type: "RECT", x: 0, y: 0, width: 600, height: 100, fill: "#ef4444" }, // Red Header
      {
        type: "TEXT",
        x: 220,
        y: 20,
        width: 200,
        height: 60,
        fill: "#ffffff",
        fontSize: 48,
        fontWeight: "bold",
        text: "SALE",
        fontFamily: '"Potta One", cursive',
      },
      {
        type: "TEXT",
        x: 30,
        y: 120,
        width: 540,
        height: 40,
        fill: "#000000",
        fontSize: 28,
        fontWeight: "bold",
        isSkuName: true,
        fontFamily: "sans-serif",
      },
      {
        type: "CIRCLE",
        x: 380,
        y: 180,
        width: 200,
        height: 200,
        fill: "#dc2626",
      }, // Price Circle
      {
        type: "TEXT",
        x: 410,
        y: 250,
        width: 150,
        height: 60,
        fill: "#ffffff",
        fontSize: 56,
        fontWeight: "bold",
        isSkuPrice: true,
        fontFamily: '"RocknRoll One", sans-serif',
      },
      {
        type: "IMAGE",
        x: 30,
        y: 180,
        width: 200,
        height: 200,
        fill: "#000",
        isSkuImage: true,
      },
    ],
  },
  {
    id: "tmpl3",
    name: "黒板風おすすめ (A4横)",
    description: "手書き風フォントが似合うおしゃれなデザイン",
    width: 800,
    height: 565,
    backgroundColor: "#1f2937", // Gray-800
    elements: [
      {
        type: "RECT",
        x: 10,
        y: 10,
        width: 780,
        height: 545,
        fill: "transparent",
      }, // Border
      {
        type: "TEXT",
        x: 30,
        y: 30,
        width: 200,
        height: 40,
        fill: "#fcd34d",
        fontSize: 24,
        fontWeight: "normal",
        text: "店長のおすすめ",
        fontFamily: '"Potta One", cursive',
      },
      {
        type: "TEXT",
        x: 30,
        y: 80,
        width: 540,
        height: 50,
        fill: "#ffffff",
        fontSize: 40,
        fontWeight: "bold",
        isSkuName: true,
        fontFamily: '"Yuji Syuku", serif',
      },
      {
        type: "TEXT",
        x: 350,
        y: 300,
        width: 200,
        height: 60,
        fill: "#fcd34d",
        fontSize: 64,
        fontWeight: "bold",
        isSkuPrice: true,
        fontFamily: '"Potta One", cursive',
      },
      {
        type: "IMAGE",
        x: 30,
        y: 160,
        width: 220,
        height: 220,
        fill: "#000",
        isSkuImage: true,
      },
    ],
  },
];

// --- Project / Collaboration Mock Data ---

export const MOCK_ROLES: Role[] = [
  {
    id: "role_admin",
    name: "システム管理者",
    description: "すべての機能にアクセスできます。",
    permissions: [
      "MASTER_VIEW",
      "MASTER_CREATE",
      "MASTER_EDIT",
      "MASTER_DELETE",
      "MASTER_IMPORT",
      "MASTER_EXPORT",
      "OMS_VIEW",
      "OMS_ORDER_CREATE",
      "EC_VIEW",
      "EC_MANAGE",
      "CREATIVE_VIEW",
      "CREATIVE_EDIT",
      "CATALOG_VIEW",
      "CATALOG_EDIT",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_EDIT",
      "ADMIN_VIEW",
      "ADMIN_MANAGE",
    ],
  },
  {
    id: "role_manager",
    name: "商品マネージャー",
    description: "マスタ管理とプロジェクト管理が可能です。",
    permissions: [
      "MASTER_VIEW",
      "MASTER_CREATE",
      "MASTER_EDIT",
      "MASTER_DELETE",
      "MASTER_IMPORT",
      "MASTER_EXPORT",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_EDIT",
      "CATALOG_VIEW",
      "CATALOG_EDIT",
    ],
  },
  {
    id: "role_staff",
    name: "店舗スタッフ",
    description:
      "在庫確認、発注、POP作成のみ可能です。プロジェクトは閲覧のみ。",
    permissions: [
      "OMS_VIEW",
      "OMS_ORDER_CREATE",
      "EC_VIEW",
      "CREATIVE_VIEW",
      "CREATIVE_EDIT",
      "PROJECT_VIEW",
    ],
  },
  {
    id: "role_creator",
    name: "コンテンツクリエイター",
    description: "WebカタログとPOP作成に特化。プロジェクトで起案可能。",
    permissions: [
      "MASTER_VIEW",
      "CATALOG_VIEW",
      "CATALOG_EDIT",
      "CREATIVE_VIEW",
      "CREATIVE_EDIT",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
    ],
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg1",
    projectId: "proj1",
    userId: "user2",
    content: "新しいスポンジの素材についてアイデアがあります！",
    timestamp: "2023-11-12 10:00",
  },
  {
    id: "msg2",
    projectId: "proj1",
    userId: "user1",
    content: "お、いいですね。ブレストボードに貼っておいてください。",
    timestamp: "2023-11-12 10:05",
  },
  {
    id: "msg3",
    projectId: "proj1",
    userId: "user3",
    content: "パッケージデザインのラフもできたので共有します。",
    timestamp: "2023-11-12 11:30",
  },
];

export const MOCK_IDEAS: BrainstormIdea[] = [
  {
    id: "idea1",
    projectId: "proj1",
    userId: "user2",
    content: "竹繊維を使った生分解性スポンジ",
    color: "green",
    votes: 2,
    attachments: [],
  },
  {
    id: "idea2",
    projectId: "proj1",
    userId: "user3",
    content: "詰め替え可能なボトルデザイン",
    color: "blue",
    votes: 1,
    attachments: [],
  },
  {
    id: "idea3",
    projectId: "proj1",
    userId: "user1",
    content: "お試しセット（3種入り）",
    color: "yellow",
    votes: 3,
    attachments: [],
  },
  {
    id: "idea4",
    projectId: "proj1",
    userId: "user2",
    content: "サブスクリプション販売モデル",
    color: "pink",
    votes: 0,
    attachments: [],
  },
];

export const MOCK_DRAFTS: SkuDraft[] = [
  {
    id: "draft1",
    projectId: "proj1",
    name: "竹炭スポンジ (仮)",
    proposedSkuId: "BAMBOO-001",
    price: 450,
    description:
      "抗菌作用のある竹炭を練り込んだプレミアムスポンジ。パッケージは紙製にしてプラ削減。",
    status: "PROPOSAL",
    authorId: "user2",
    createdAt: "2023-11-15",
    linkedIdeaId: "idea1",
  },
  {
    id: "draft2",
    projectId: "proj1",
    name: "詰め替えボトル 500ml",
    proposedSkuId: "BOTTLE-RE-500",
    price: 800,
    description: "シンプルで長く使えるデザインボトル。",
    status: "APPROVED",
    authorId: "user3",
    createdAt: "2023-11-16",
  },
];

export const MOCK_EXPORT_CHANNELS: ExportChannel[] = [
  {
    id: "ch_amazon",
    name: "Amazon JP",
    fileFormat: "CSV",
    columns: [
      {
        id: "c1",
        headerName: "external_product_id",
        sourceField: "barcode",
        defaultValue: "",
      },
      {
        id: "c2",
        headerName: "item_name",
        sourceField: "name",
        defaultValue: "",
      },
      {
        id: "c3",
        headerName: "standard_price",
        sourceField: "price",
        defaultValue: "",
      },
      {
        id: "c4",
        headerName: "brand_name",
        sourceField: "seriesId",
        defaultValue: "Generic",
      },
    ],
    lastExported: "2023-11-20 14:00",
  },
  {
    id: "ch_rakuten",
    name: "楽天市場 (CSV)",
    fileFormat: "CSV",
    columns: [
      {
        id: "c1",
        headerName: "商品管理番号",
        sourceField: "skuId",
        defaultValue: "",
      },
      { id: "c2", headerName: "商品名", sourceField: "name", defaultValue: "" },
      {
        id: "c3",
        headerName: "販売価格",
        sourceField: "price",
        defaultValue: "",
      },
      {
        id: "c4",
        headerName: "PC用商品説明文",
        sourceField: "name",
        defaultValue: "",
      },
    ],
    lastExported: "2023-11-18 09:30",
  },
];

export const MOCK_EXTENSIONS: ExtensionMetadata[] = [
  {
    id: "OMS",
    name: "在庫・発注管理システム",
    description:
      "店舗在庫の可視化、本部への発注、店舗間移動、ドライバー手配などのロジスティクス機能を提供します。",
    price: 10000,
    icon: ICONS.truck,
  },
  {
    id: "EC",
    name: "EC連携サービス",
    description: "オンラインストア専用の在庫管理と受注処理機能を追加します。",
    price: 15000,
    icon: ICONS.globe,
  },
  {
    id: "CREATIVE",
    name: "POP作成スタジオ",
    description:
      "直感的なドラッグ＆ドロップ操作で、店舗用POPやプライスカードを簡単に作成・共有できます。",
    price: 5000,
    icon: ICONS.palette,
  },
  {
    id: "CATALOG",
    name: "Webカタログビルダー",
    description:
      "ノーコードで魅力的な商品特集ページやカタログサイトを作成し、公開できます。",
    price: 8000,
    icon: ICONS.book,
  },
  {
    id: "PROJECT",
    name: "企画プロジェクト管理",
    description:
      "チームでの新商品開発、チャット、アイデアブレインストーミング、SKU起案ワークフローを実現します。",
    price: 12000,
    icon: ICONS.users,
  },
  {
    id: "EXPORT",
    name: "チャネルエクスポート",
    description:
      "Amazon, 楽天など各モール形式に合わせて商品データをCSV出力。マッピング設定も可能です。",
    price: 3000,
    icon: ICONS.exportCloud,
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif1",
    title: "システムメンテナンス",
    message: "定期メンテナンスが完了しました。",
    type: "SYSTEM",
    actorId: "role_admin",
    timestamp: "2023-11-20 09:00",
    isRead: true,
  },
  {
    id: "notif2",
    title: "SKUドラフト承認",
    message: "「詰め替えボトル 500ml」が承認されました。",
    type: "PROJECT",
    actorId: "user3",
    timestamp: "2023-11-21 14:30",
    isRead: false,
  },
  {
    id: "notif3",
    title: "在庫アラート",
    message: "渋谷本店で「iPhone 14 Pro」の在庫が減少しています。",
    type: "ALERT",
    actorId: "user_full",
    timestamp: "2023-11-22 10:15",
    isRead: false,
  },
  {
    id: "notif4",
    title: "新規発注",
    message: "大阪梅田店から新規発注がありました。",
    type: "ORDER",
    actorId: "user4",
    timestamp: "2023-11-22 11:00",
    isRead: true,
  },
];
