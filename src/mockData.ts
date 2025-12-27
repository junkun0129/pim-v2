import type { ExtensionMetadata } from "./types";
import { ICONS } from "./constants";

export const EXTENSIONS: ExtensionMetadata[] = [
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
