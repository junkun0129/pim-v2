import React, { useState } from "react";
import type {
  WebCatalog,
  CatalogSection,
  Sku,
  Category,
  Series,
} from "../src/types";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Badge from "./ui/Badge";
import { ICONS } from "../src/constants";
import { getCategoryPath } from "../utils";

interface WebCatalogManagerProps {
  catalogs: WebCatalog[];
  skus: Sku[];
  categories: Category[];
  series: Series[];
  onSaveCatalog: (catalog: WebCatalog) => void;
  onDeleteCatalog: (id: string) => void;
}

export default function WebCatalogManager({
  catalogs,
  skus,
  categories,
  series,
  onSaveCatalog,
  onDeleteCatalog,
}: WebCatalogManagerProps) {
  const [viewMode, setViewMode] = useState<"LIST" | "EDIT" | "PREVIEW">("LIST");
  const [activeCatalog, setActiveCatalog] = useState<WebCatalog | null>(null);
  const [activeTab, setActiveTab] = useState<"CONTENT" | "DESIGN">("CONTENT");

  // --- Editor State ---
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");
  const [editFont, setEditFont] = useState<"SANS" | "SERIF" | "MONO">("SANS");
  const [editCorner, setEditCorner] = useState<"SHARP" | "ROUNDED" | "PILL">(
    "ROUNDED"
  );
  const [editLogo, setEditLogo] = useState("");
  const [editSections, setEditSections] = useState<CatalogSection[]>([]);

  const handleCreateNew = () => {
    const newCatalog: WebCatalog = {
      id: `cat-web-${Date.now()}`,
      name: "新しいカタログ",
      description: "",
      themeColor: "#3b82f6",
      fontFamily: "SANS",
      cornerStyle: "ROUNDED",
      sections: [],
      status: "DRAFT",
      lastUpdated: new Date().toISOString(),
    };
    startEdit(newCatalog);
  };

  const startEdit = (catalog: WebCatalog) => {
    setActiveCatalog(catalog);
    setEditName(catalog.name);
    setEditDesc(catalog.description);
    setEditColor(catalog.themeColor);
    setEditFont(catalog.fontFamily || "SANS");
    setEditCorner(catalog.cornerStyle || "ROUNDED");
    setEditLogo(catalog.logoUrl || "");
    setEditSections(JSON.parse(JSON.stringify(catalog.sections))); // Deep copy
    setViewMode("EDIT");
    setActiveTab("CONTENT");
  };

  const saveChanges = () => {
    if (!activeCatalog) return;
    const updated: WebCatalog = {
      ...activeCatalog,
      name: editName,
      description: editDesc,
      themeColor: editColor,
      fontFamily: editFont,
      cornerStyle: editCorner,
      logoUrl: editLogo,
      sections: editSections,
      lastUpdated: new Date().toISOString(),
    };
    onSaveCatalog(updated);
    setViewMode("LIST");
    setActiveCatalog(null);
  };

  const handleAddSection = (type: CatalogSection["type"]) => {
    const newSection: CatalogSection = {
      id: `sec-${Date.now()}`,
      type,
      title:
        type === "HERO"
          ? "Hero Title"
          : type === "GRID_CATEGORY"
          ? "Category Name"
          : type === "RICH_TEXT"
          ? "見出しを入力"
          : type === "VIDEO"
          ? "Featured Video"
          : "Product Spotlight",
      subtitle: type === "HERO" ? "Enter your subtitle here" : undefined,
      imageUrl:
        type === "HERO"
          ? "https://placehold.co/1200x400/e2e8f0/64748b?text=Hero+Image"
          : undefined,
      content:
        type === "RICH_TEXT"
          ? "ここにテキストを入力してください。ブランドのストーリーや商品の詳細など、自由な文章で魅力を伝えましょう。"
          : undefined,
      videoUrl:
        type === "VIDEO"
          ? "https://www.w3schools.com/html/mov_bbb.mp4"
          : undefined,
    };
    setEditSections([...editSections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<CatalogSection>) => {
    setEditSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSection = (id: string) => {
    setEditSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...editSections];
    if (direction === "up" && index > 0) {
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
    }
    setEditSections(newSections);
  };

  // --- Render Helpers ---

  const renderPreviewContent = () => {
    // Theme Styles
    const fontClass =
      editFont === "SERIF"
        ? "font-serif"
        : editFont === "MONO"
        ? "font-mono"
        : "font-sans";
    const radiusClass =
      editCorner === "SHARP"
        ? "rounded-none"
        : editCorner === "PILL"
        ? "rounded-2xl"
        : "rounded-lg";
    const btnRadiusClass =
      editCorner === "SHARP"
        ? "rounded-none"
        : editCorner === "PILL"
        ? "rounded-full"
        : "rounded-lg";

    return (
      <div className={`bg-white min-h-screen ${fontClass}`}>
        {/* Preview Header (Simulated) */}
        <div
          className="text-white py-4 px-6 shadow-md"
          style={{ backgroundColor: editColor }}
        >
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              {editLogo && (
                <img
                  src={editLogo}
                  alt="Logo"
                  className="h-8 w-8 object-contain bg-white rounded p-0.5"
                />
              )}
              <h1 className="text-xl font-bold tracking-tight">{editName}</h1>
            </div>
            <nav className="space-x-4 text-sm font-medium opacity-90 hidden sm:block">
              <span>Home</span>
              <span>Products</span>
              <span>Stories</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto pb-20">
          {editSections.map((section) => {
            // --- RENDER HERO ---
            if (section.type === "HERO") {
              return (
                <div
                  key={section.id}
                  className={`relative w-full h-80 md:h-[500px] overflow-hidden mb-12 shadow-lg ${
                    editCorner === "SHARP" ? "" : "rounded-b-3xl"
                  }`}
                >
                  <img
                    src={section.imageUrl}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16 text-left">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md leading-tight">
                      {section.title}
                    </h2>
                    <p className="text-lg md:text-xl text-slate-100 drop-shadow-sm max-w-2xl">
                      {section.subtitle}
                    </p>
                    <button
                      className={`mt-8 px-8 py-3 font-bold text-white w-max transition-transform hover:scale-105 text-sm md:text-base shadow-lg ${btnRadiusClass}`}
                      style={{ backgroundColor: editColor }}
                    >
                      View Collection
                    </button>
                  </div>
                </div>
              );
            }

            // --- RENDER RICH TEXT ---
            if (section.type === "RICH_TEXT") {
              return (
                <div
                  key={section.id}
                  className="py-16 px-6 max-w-4xl mx-auto text-center"
                >
                  <h3 className="text-3xl font-bold text-zinc-800 mb-6">
                    {section.title}
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                  <div
                    className="w-20 h-1 mx-auto mt-8 opacity-50"
                    style={{ backgroundColor: editColor }}
                  ></div>
                </div>
              );
            }

            // --- RENDER VIDEO ---
            if (section.type === "VIDEO") {
              return (
                <div
                  key={section.id}
                  className="py-12 px-6 bg-slate-900 text-white my-12"
                >
                  <div className="max-w-5xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-8 tracking-widest uppercase">
                      {section.title}
                    </h3>
                    <div
                      className={`aspect-video w-full bg-black overflow-hidden shadow-2xl border border-zinc-700 ${radiusClass}`}
                    >
                      {section.videoUrl ? (
                        <video
                          src={section.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          Video Placeholder
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // --- RENDER GRID ---
            if (section.type === "GRID_CATEGORY") {
              const catSkus = skus.filter(
                (s) =>
                  section.targetId && s.categoryIds.includes(section.targetId)
              );
              return (
                <div key={section.id} className="py-12 px-6">
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-bold text-zinc-800">
                      {section.title}
                    </h3>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {catSkus.length > 0 ? (
                      catSkus.map((sku) => (
                        <div
                          key={sku.id}
                          className={`group bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden ${radiusClass}`}
                        >
                          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                            <img
                              src={
                                sku.imageUrl || "https://placehold.co/300x400"
                              }
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={sku.name}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end">
                              <span className="text-white font-bold">
                                Quick View
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-slate-800 truncate text-sm md:text-base mb-1">
                              {sku.name}
                            </h4>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                              <span
                                className="font-bold text-sm"
                                style={{ color: editColor }}
                              >
                                ¥{sku.price?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 md:col-span-4 text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        商品が見つかりません
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            // --- RENDER SPOTLIGHT ---
            if (section.type === "SPOTLIGHT_SKU") {
              const sku = skus.find((s) => s.id === section.targetId);
              if (!sku) return null;
              return (
                <div key={section.id} className="py-16 px-6 bg-slate-50 mb-12">
                  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2">
                      <div
                        className={`aspect-square overflow-hidden shadow-2xl relative bg-white ${radiusClass}`}
                      >
                        <img
                          src={sku.imageUrl || "https://placehold.co/600x600"}
                          className="w-full h-full object-cover"
                          alt={sku.name}
                        />
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-6 py-2 text-sm font-bold shadow-sm tracking-widest">
                          RECOMMENDED
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                      <div>
                        <p className="text-sm font-bold tracking-widest uppercase mb-2 text-slate-400">
                          Featured Product
                        </p>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                          {section.title || sku.name}
                        </h3>
                      </div>
                      <p className="text-lg text-slate-600 leading-relaxed font-light">
                        {sku.name}
                        の魅力的な機能をご紹介します。最高品質の素材と最新のテクノロジーを融合させた、あなたの生活を豊かにする一品です。
                      </p>

                      <div className="flex items-center gap-6">
                        <p
                          className="text-3xl font-bold"
                          style={{ color: editColor }}
                        >
                          ¥{sku.price?.toLocaleString()}
                        </p>
                        <button
                          className={`px-8 py-4 font-bold text-white shadow-lg transition-transform hover:-translate-y-1 ${btnRadiusClass}`}
                          style={{ backgroundColor: editColor }}
                        >
                          商品詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        <div className="bg-zinc-900 text-slate-400 py-16 px-6">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">
                {editName}
              </h4>
              <p className="text-sm leading-loose">
                We bring quality products to your life.
                <br />
                Experience the difference today.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">
                Links
              </h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-sm">
                Follow Us
              </h4>
              <div className="flex justify-center md:justify-start gap-4">
                <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
                <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
                <div className="w-8 h-8 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-xs">
            &copy; 2023 {editName}. All rights reserved.
          </div>
        </div>
      </div>
    );
  };

  // --- VIEW: LIST ---
  if (viewMode === "LIST") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              {ICONS.book} Web Catalog
            </h1>
            <p className="text-slate-500 mt-1">
              プロモーション用の特設ページを作成・管理します
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            {ICONS.plus} 新規カタログ作成
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card
              key={catalog.id}
              className="group relative overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 !p-0 border-0"
            >
              {/* Header Color Strip */}
              <div
                className="h-24 w-full relative"
                style={{ backgroundColor: catalog.themeColor }}
              >
                <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center border border-slate-100 dark:border-zinc-700 z-10 overflow-hidden">
                  {catalog.logoUrl ? (
                    <img
                      src={catalog.logoUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-zinc-700 flex items-center justify-center">
                      <span className="font-bold text-xs text-slate-500">
                        Web
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {catalog.name}
                  </h3>
                  <Badge
                    color={catalog.status === "PUBLISHED" ? "green" : "gray"}
                  >
                    {catalog.status}
                  </Badge>
                </div>
                <div className="flex gap-2 mb-4">
                  <Badge color="gray" className="text-[10px]">
                    {catalog.fontFamily}
                  </Badge>
                  <Badge color="gray" className="text-[10px]">
                    {catalog.cornerStyle}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                  {catalog.description || "説明なし"}
                </p>

                <div className="text-xs text-slate-400 mb-4">
                  最終更新: {new Date(catalog.lastUpdated).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => startEdit(catalog)}
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                  >
                    編集
                  </Button>
                  <Button
                    onClick={() => onDeleteCatalog(catalog.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Empty State Create Card */}
          <button
            onClick={handleCreateNew}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-900 dark:hover:border-zinc-700 transition-all group h-full min-h-[240px]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              {ICONS.plus}
            </div>
            <span className="font-bold text-slate-600 dark:text-slate-300">
              新しいカタログを作成
            </span>
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: PREVIEW ---
  if (viewMode === "PREVIEW") {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto animate-fade-in">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-400 hidden sm:inline">
              PREVIEW MODE
            </span>
            <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
            <span className="font-bold text-slate-800 truncate">
              {editName}
            </span>
          </div>
          <Button onClick={() => setViewMode("EDIT")}>エディタに戻る</Button>
        </div>
        <div className="pt-16">{renderPreviewContent()}</div>
      </div>
    );
  }

  // --- VIEW: EDITOR ---
  return (
    <div className="h-full flex flex-col -m-4 md:-m-10">
      {/* Editor Header */}
      <div className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("LIST")}>
            &larr; 一覧
          </Button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block"></div>
          <span className="font-bold text-slate-800 dark:text-white truncate max-w-[120px] md:max-w-none">
            カタログエディタ
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewMode("PREVIEW")}
            className="hidden sm:flex"
          >
            プレビュー
          </Button>
          <Button
            onClick={saveChanges}
            size="sm"
            className="shadow-lg shadow-blue-500/20"
          >
            保存
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Settings & Sections */}
        <div className="w-full md:w-80 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("CONTENT")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "CONTENT"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              構成 (Sections)
            </button>
            <button
              onClick={() => setActiveTab("DESIGN")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === "DESIGN"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              デザイン (Design)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
            {activeTab === "DESIGN" ? (
              // --- DESIGN TAB ---
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    基本情報
                  </h3>
                  <Input
                    label="カタログ名"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input
                    label="説明 (内部用)"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-800 my-4"></div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ブランディング
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">
                      テーマカラー
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs font-mono text-slate-500">
                        {editColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Input
                      label="ロゴURL"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-800 my-4"></div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    スタイル
                  </h3>
                  <Select
                    label="フォント"
                    value={editFont}
                    onChange={(e) => setEditFont(e.target.value as any)}
                  >
                    <option value="SANS">Sans Serif (Modern)</option>
                    <option value="SERIF">Serif (Elegant)</option>
                    <option value="MONO">Monospace (Technical)</option>
                  </Select>
                  <Select
                    label="角の形状 (Radius)"
                    value={editCorner}
                    onChange={(e) => setEditCorner(e.target.value as any)}
                  >
                    <option value="SHARP">Sharp (四角)</option>
                    <option value="ROUNDED">Rounded (標準)</option>
                    <option value="PILL">Pill (丸)</option>
                  </Select>
                </div>
              </div>
            ) : (
              // --- CONTENT TAB ---
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  セクション一覧
                </h3>
                <div className="space-y-3 mb-6">
                  {editSections.map((section, index) => (
                    <div
                      key={section.id}
                      className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 border border-slate-200 dark:border-zinc-700 group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge color="blue" className="text-[10px]">
                          {section.type}
                        </Badge>
                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveSection(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveSection(index, "down")}
                            disabled={index === editSections.length - 1}
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeSection(section.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={section.title || ""}
                          onChange={(e) =>
                            updateSection(section.id, { title: e.target.value })
                          }
                          className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                          placeholder="タイトル"
                        />

                        {section.type === "HERO" && (
                          <input
                            type="text"
                            value={section.subtitle || ""}
                            onChange={(e) =>
                              updateSection(section.id, {
                                subtitle: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                            placeholder="サブタイトル"
                          />
                        )}

                        {section.type === "RICH_TEXT" && (
                          <textarea
                            value={section.content || ""}
                            onChange={(e) =>
                              updateSection(section.id, {
                                content: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 h-20"
                            placeholder="本文テキスト..."
                          />
                        )}

                        {(section.type === "GRID_CATEGORY" ||
                          section.type === "SPOTLIGHT_SKU") && (
                          <select
                            value={section.targetId || ""}
                            onChange={(e) =>
                              updateSection(section.id, {
                                targetId: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1"
                          >
                            <option value="">対象を選択</option>
                            {section.type === "GRID_CATEGORY"
                              ? categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {getCategoryPath(c.id, categories)}
                                  </option>
                                ))
                              : skus.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                    セクション追加
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddSection("HERO")}
                      className="justify-start text-xs"
                    >
                      🖼️ ヒーロー
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddSection("RICH_TEXT")}
                      className="justify-start text-xs"
                    >
                      📝 テキスト
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddSection("GRID_CATEGORY")}
                      className="justify-start text-xs"
                    >
                      📦 カテゴリ
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddSection("SPOTLIGHT_SKU")}
                      className="justify-start text-xs"
                    >
                      ⭐ 特集商品
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddSection("VIDEO")}
                      className="justify-start text-xs col-span-2"
                    >
                      🎥 動画埋め込み
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview Canvas */}
        <div className="flex-1 bg-slate-200 dark:bg-black overflow-auto p-4 md:p-8 flex justify-center shadow-inner">
          <div className="w-full max-w-5xl bg-white shadow-2xl min-h-[400px] md:min-h-[800px] rounded-sm ring-1 ring-slate-900/5 origin-top md:scale-100 transition-transform">
            {renderPreviewContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
