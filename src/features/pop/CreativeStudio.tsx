import React, { useState, useRef, useEffect } from "react";
import type {
  Sku,
  Branch,
  DesignElement,
  ElementType,
  PopTemplate,
  Asset,
} from "../src/types";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Select from "./ui/Select";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import { ICONS } from "../src/constants";
import { MOCK_POP_TEMPLATES } from "../src/mockData";

declare const JsBarcode: any;
declare const jspdf: any;

interface CreativeStudioProps {
  skus: Sku[];
  branches: Branch[];
  onSaveAsset: (skuId: string, assetName: string, assetDataUrl: string) => void;
}

export default function CreativeStudio({
  skus,
  branches,
  onSaveAsset,
}: CreativeStudioProps) {
  const [activeTab, setActiveTab] = useState<"DESIGN" | "HISTORY">("DESIGN");

  // Layout State
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // Form State
  const [assetName, setAssetName] = useState("New POP");
  const [paperColor, setPaperColor] = useState("#ffffff");
  const [overridePrice, setOverridePrice] = useState<number>(0);

  // Canvas State
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(565); // A4 Landscape ratio (approx)

  // Template Saving State
  const [customTemplates, setCustomTemplates] = useState<PopTemplate[]>([]);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");

  const svgRef = useRef<SVGSVGElement>(null);

  const selectedSku = skus.find((s) => s.id === selectedSkuId);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const allTemplates = [...MOCK_POP_TEMPLATES, ...customTemplates];

  // Filter assets for the current SKU to show history
  const skuAssets =
    selectedSku?.assets?.filter((a) => a.type === "DESIGN") || [];

  // Update default override price when SKU changes
  useEffect(() => {
    if (selectedSku && selectedSku.price) {
      setOverridePrice(selectedSku.price);
      setAssetName(`${selectedSku.name} POP`);
    } else {
      setOverridePrice(0);
      setAssetName("New POP");
    }
  }, [selectedSkuId, selectedSku]);

  // --- Dragging Logic (Window Level for robustness) ---
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart && selectedElementId) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        setElements((prev) =>
          prev.map((el) => {
            if (el.id === selectedElementId) {
              return { ...el, x: el.x + dx, y: el.y + dy };
            }
            return el;
          })
        );

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleWindowMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging, dragStart, selectedElementId]);

  // --- Helper: Generate Barcode Image ---
  const generateBarcode = (value: string): string => {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, value, {
        format: "CODE128",
        displayValue: true,
        margin: 0,
        height: 40,
      });
      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error("Barcode generation failed", e);
      return "";
    }
  };

  // --- Tools ---

  const addElement = (
    type: ElementType,
    config: Partial<DesignElement> = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const baseElement: DesignElement = {
      id,
      type,
      x: 50, // Default positions slightly offset so they don't stack perfectly
      y: 50,
      width: 100,
      height: 100,
      fill: "#000000",
      ...config,
    };

    if (type === "RECT" && !config.width) {
      baseElement.width = 100;
      baseElement.height = 100;
      baseElement.fill = "#fcd34d"; // Amber-300
    } else if (type === "CIRCLE" && !config.width) {
      baseElement.width = 80;
      baseElement.height = 80;
      baseElement.fill = "#ef4444"; // Red-500
    } else if (type === "TEXT" && !config.text) {
      baseElement.width = 200;
      baseElement.height = 40;
      baseElement.text = "テキスト";
      baseElement.fontSize = 24;
      baseElement.fill = "#000000";
      baseElement.fontWeight = "normal";
      baseElement.fontFamily = "sans-serif";
    }

    setElements((prev) => [...prev, baseElement]);
    setSelectedElementId(id);
    setIsRightPanelOpen(true);
  };

  // --- Template Logic ---

  const applyTemplate = (template: PopTemplate) => {
    if (!selectedSku) {
      alert("先にSKUを選択してください");
      return;
    }

    if (
      elements.length > 0 &&
      !window.confirm("キャンバスをクリアしてテンプレートを適用しますか？")
    )
      return;

    setPaperColor(template.backgroundColor);
    if (template.width) setCanvasWidth(template.width);
    if (template.height) setCanvasHeight(template.height);

    // Map template elements to new DesignElements with IDs
    const newElements: DesignElement[] = template.elements.map((tmplEl) => {
      const id = Math.random().toString(36).substr(2, 9);
      // Create a deep copy to avoid reference issues
      let el: DesignElement = {
        ...tmplEl,
        id,
        // Ensure defaults if missing in template
        width: tmplEl.width || 100,
        height: tmplEl.height || 100,
        x: tmplEl.x || 0,
        y: tmplEl.y || 0,
        fill: tmplEl.fill || "#000",
      };

      // Inject Data
      if (el.isSkuName) {
        el.text = selectedSku.name;
      }
      if (el.isSkuPrice) {
        el.text = `¥${overridePrice.toLocaleString()}`;
      }
      if (el.isSkuBarcode) {
        // For template, if it marks barcode, we generate the image
        const code = selectedSku.barcode || "4900000000000";
        const barcodeDataUrl = generateBarcode(code);
        el.type = "IMAGE"; // Force type to image
        el.imageUrl = barcodeDataUrl;
        el.text = undefined; // Remove text property if it was set
      }
      if (el.isSkuImage && selectedSku.imageUrl) {
        el.imageUrl = selectedSku.imageUrl;
      }

      return el;
    });

    setElements(newElements);
    setAssetName(`${selectedSku.name} - ${template.name}`);
  };

  const handleSaveTemplate = () => {
    const newTemplate: PopTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      name: newTemplateName,
      description: newTemplateDesc,
      backgroundColor: paperColor,
      width: canvasWidth,
      height: canvasHeight,
      // Strip IDs for template
      elements: elements.map(({ id, ...rest }) => rest),
    };
    setCustomTemplates([...customTemplates, newTemplate]);
    setIsSaveTemplateModalOpen(false);
    setNewTemplateName("");
    setNewTemplateDesc("");
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("このテンプレートを削除しますか？")) {
      setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // --- POP Specific Helpers ---

  const addSkuName = () => {
    if (!selectedSku) return;
    addElement("TEXT", {
      text: selectedSku.name,
      fontSize: 28,
      fontWeight: "bold",
      fill: "#1e293b",
      fontFamily: "sans-serif",
      x: 20,
      y: 20,
    });
  };

  const addSkuPrice = () => {
    addElement("TEXT", {
      text: `¥${overridePrice.toLocaleString()}`,
      fontSize: 64,
      fontWeight: "bold",
      fill: "#dc2626",
      fontFamily: '"RocknRoll One", sans-serif',
      x: 20,
      y: 100,
    });
  };

  const addSkuImage = () => {
    if (!selectedSku || !selectedSku.imageUrl) return;
    addElement("IMAGE", {
      imageUrl: selectedSku.imageUrl,
      width: 150,
      height: 150,
      x: 400,
      y: 50,
    });
  };

  const addSkuBarcode = () => {
    if (!selectedSku) return;
    const code = selectedSku.barcode || "4900000000000";
    const barcodeDataUrl = generateBarcode(code);

    if (barcodeDataUrl) {
      addElement("IMAGE", {
        imageUrl: barcodeDataUrl,
        width: 200,
        height: 80,
        x: 20,
        y: 350,
      });
    }
  };

  const deleteSelected = () => {
    if (selectedElementId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  };

  // --- Canvas Interaction ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop bubbling to canvas
    e.preventDefault(); // Prevent text selection
    setSelectedElementId(id);
    setIsRightPanelOpen(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const updateSelectedProperty = (key: keyof DesignElement, value: any) => {
    if (selectedElementId) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedElementId ? { ...el, [key]: value } : el
        )
      );
    }
  };

  const handleCanvasClick = () => {
    setSelectedElementId(null);
  };

  // --- Output Logic ---

  const getImageDataUrl = async (
    type: "image/png" | "image/jpeg" = "image/png"
  ): Promise<string | null> => {
    if (!svgRef.current) return null;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (
      !source.match(
        /^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/
      )
    ) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill background
          ctx.fillStyle = paperColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(type);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.src = url;
    });
  };

  const handleSave = async () => {
    if (!selectedSkuId) return;
    const pngDataUrl = await getImageDataUrl();
    if (pngDataUrl) {
      const finalName = selectedBranch
        ? `[${selectedBranch.name}] ${assetName}`
        : assetName;
      onSaveAsset(selectedSkuId, finalName, pngDataUrl);
    }
  };

  const handleDownloadImage = async () => {
    const pngDataUrl = await getImageDataUrl();
    if (pngDataUrl) {
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = `${assetName || "pop-design"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadPDF = async () => {
    const pngDataUrl = await getImageDataUrl();
    if (!pngDataUrl) return;

    try {
      const { jsPDF } = jspdf;
      const orientation = canvasWidth > canvasHeight ? "l" : "p";
      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [canvasWidth, canvasHeight],
      });

      pdf.addImage(pngDataUrl, "PNG", 0, 0, canvasWidth, canvasHeight);
      pdf.save(`${assetName || "pop-design"}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
      alert("PDF生成に失敗しました。印刷機能を使用してください。");
      // Fallback to print
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(
          `<html><body><img src="${pngDataUrl}" onload="window.print();window.close()"/></body></html>`
        );
        printWindow.document.close();
      }
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const paperColors = [
    { name: "ホワイト", value: "#ffffff" },
    { name: "イエロー", value: "#fef9c3" },
    { name: "ピンク", value: "#fce7f3" },
    { name: "ブラック", value: "#1f2937" },
  ];

  const fontFamilies = [
    { name: "ゴシック (標準)", value: "sans-serif" },
    { name: "明朝体 (エレガント)", value: '"Yuji Syuku", serif' },
    { name: "ポップ体 (太字・元気)", value: '"Potta One", cursive' },
    { name: "丸ゴシック (親しみ)", value: '"RocknRoll One", sans-serif' },
  ];

  const renderDesignView = () => (
    <div className="flex flex-1 overflow-hidden min-h-0 relative h-full">
      {/* Left Sidebar: Tools & Templates */}
      <div
        className={`bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-10 ${
          isLeftPanelOpen ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="w-72 h-full overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
          {/* Document Settings */}
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-3">
              キャンバス設定
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Input
                label="幅 (px)"
                type="number"
                value={canvasWidth}
                onChange={(e) =>
                  setCanvasWidth(parseInt(e.target.value) || 100)
                }
                className="text-xs"
              />
              <Input
                label="高さ (px)"
                type="number"
                value={canvasHeight}
                onChange={(e) =>
                  setCanvasHeight(parseInt(e.target.value) || 100)
                }
                className="text-xs"
              />
            </div>
            <div className="flex gap-2">
              {paperColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setPaperColor(c.value)}
                  className={`w-6 h-6 rounded-full border shadow-sm ${
                    paperColor === c.value
                      ? "border-zinc-900 ring-2 ring-zinc-200 dark:ring-zinc-700"
                      : "border-slate-200"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800"></div>

          {/* Templates */}
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-3">
              テンプレート
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allTemplates.map((tmpl) => {
                const isCustom = customTemplates.some(
                  (ct) => ct.id === tmpl.id
                );
                return (
                  <div key={tmpl.id} className="relative group">
                    <button
                      onClick={() => applyTemplate(tmpl)}
                      className="w-full relative border border-slate-200 dark:border-zinc-700 rounded-lg p-1.5 hover:ring-2 hover:ring-zinc-900 dark:hover:ring-white transition-all text-left bg-slate-50 dark:bg-zinc-800"
                      disabled={!selectedSku}
                    >
                      <div
                        className="w-full h-12 rounded border border-slate-200/50 flex items-center justify-center text-[10px] text-slate-400"
                        style={{ backgroundColor: tmpl.backgroundColor }}
                      >
                        {tmpl.width && tmpl.height
                          ? `${tmpl.width}x${tmpl.height}`
                          : ""}
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1 truncate group-hover:text-zinc-900 dark:group-hover:text-white">
                        {tmpl.name}
                      </p>
                    </button>
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(tmpl.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="テンプレートを削除"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-3 text-xs"
              onClick={() => setIsSaveTemplateModalOpen(true)}
            >
              現在のデザインを保存
            </Button>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800"></div>

          {/* Manual Tools */}
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-3">
              スマート挿入
            </h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={addSkuName}
                disabled={!selectedSku}
                className="w-full justify-start text-xs !py-2"
              >
                <span className="mr-2">📝</span> 商品名
              </Button>
              <Button
                variant="secondary"
                onClick={addSkuPrice}
                disabled={!selectedSku}
                className="w-full justify-start text-xs font-bold text-red-600 !py-2"
              >
                <span className="mr-2">¥</span> 価格
              </Button>
              <Button
                variant="secondary"
                onClick={addSkuImage}
                disabled={!selectedSku?.imageUrl}
                className="w-full justify-start text-xs !py-2"
              >
                <span className="mr-2">🖼️</span> 商品画像
              </Button>
              <Button
                variant="secondary"
                onClick={addSkuBarcode}
                disabled={!selectedSku}
                className="w-full justify-start text-xs font-mono !py-2"
              >
                <span className="mr-2">|||</span> バーコード
              </Button>
            </div>

            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mt-5 mb-3">
              基本図形
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => addElement("RECT")}
                className="text-xs"
              >
                □ 四角
              </Button>
              <Button
                variant="secondary"
                onClick={() => addElement("CIRCLE")}
                className="text-xs"
              >
                ○ 円
              </Button>
              <Button
                variant="secondary"
                onClick={() => addElement("TEXT")}
                className="text-xs col-span-2"
              >
                T テキスト
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Left Toggle Button (Floating) */}
      <button
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 bg-white dark:bg-zinc-800 border-y border-r border-zinc-200 dark:border-zinc-700 rounded-r-lg shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 transition-all duration-300 ${
          isLeftPanelOpen ? "left-72" : "left-0"
        }`}
        title={isLeftPanelOpen ? "ツールバーを閉じる" : "ツールバーを開く"}
      >
        {isLeftPanelOpen ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        )}
      </button>

      {/* Center: Main Canvas Area */}
      <div
        className="flex-1 bg-zinc-100 dark:bg-zinc-950/50 overflow-auto flex items-center justify-center relative shadow-inner p-8"
        onClick={handleCanvasClick}
      >
        <div
          className="relative shadow-2xl bg-white transition-all duration-200"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          <svg
            ref={svgRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ backgroundColor: paperColor }}
          >
            {elements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const stroke = isSelected ? "#3b82f6" : "transparent"; // Blue selection border
              const strokeWidth = isSelected ? 2 : 0;
              const cursorStyle = isSelected
                ? isDragging
                  ? "grabbing"
                  : "grab"
                : "pointer";

              if (el.type === "RECT") {
                return (
                  <rect
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={el.fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: cursorStyle }}
                  />
                );
              } else if (el.type === "CIRCLE") {
                return (
                  <ellipse
                    key={el.id}
                    cx={el.x + el.width / 2}
                    cy={el.y + el.height / 2}
                    rx={el.width / 2}
                    ry={el.height / 2}
                    fill={el.fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: cursorStyle }}
                  />
                );
              } else if (el.type === "TEXT") {
                return (
                  <text
                    key={el.id}
                    x={el.x}
                    y={el.y + (el.fontSize || 24)} // SVG text y is baseline
                    fill={el.fill}
                    fontSize={el.fontSize}
                    fontWeight={el.fontWeight}
                    fontFamily={el.fontFamily || "sans-serif"}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: cursorStyle, userSelect: "none" }}
                  >
                    {el.text}
                  </text>
                );
              } else if (el.type === "IMAGE" && el.imageUrl) {
                return (
                  <image
                    key={el.id}
                    href={el.imageUrl}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      cursor: cursorStyle,
                      outline: isSelected ? "2px solid #3b82f6" : "none",
                    }}
                    preserveAspectRatio="none"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono pointer-events-none bg-white/80 p-1 rounded">
          {canvasWidth} x {canvasHeight} px
        </div>
      </div>

      {/* Right Toggle Button (Floating) */}
      <button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 bg-white dark:bg-zinc-800 border-y border-l border-zinc-200 dark:border-zinc-700 rounded-l-lg shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 transition-all duration-300 ${
          isRightPanelOpen ? "right-72" : "right-0"
        }`}
        title={isRightPanelOpen ? "プロパティを閉じる" : "プロパティを開く"}
      >
        {isRightPanelOpen ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        )}
      </button>

      {/* Right Sidebar: Properties */}
      <div
        className={`bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-10 ${
          isRightPanelOpen
            ? "w-72 opacity-100"
            : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="w-72 h-full overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
            プロパティ
          </h3>

          {selectedElement ? (
            <div className="space-y-4">
              <div className="text-[10px] text-slate-400 font-mono mb-2 bg-slate-50 dark:bg-zinc-800 p-1 rounded">
                ID: {selectedElement.id}
              </div>

              {(selectedElement.type === "RECT" ||
                selectedElement.type === "CIRCLE" ||
                selectedElement.type === "TEXT") && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    塗りつぶし色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) =>
                        updateSelectedProperty("fill", e.target.value)
                      }
                      className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {selectedElement.fill}
                    </span>
                  </div>
                </div>
              )}

              {selectedElement.type === "TEXT" && (
                <>
                  <Input
                    label="テキスト内容"
                    value={selectedElement.text || ""}
                    onChange={(e) =>
                      updateSelectedProperty("text", e.target.value)
                    }
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      フォント (書体)
                    </label>
                    <select
                      value={selectedElement.fontFamily || "sans-serif"}
                      onChange={(e) =>
                        updateSelectedProperty("fontFamily", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm"
                    >
                      {fontFamilies.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="フォントサイズ"
                    type="number"
                    value={selectedElement.fontSize || 24}
                    onChange={(e) =>
                      updateSelectedProperty(
                        "fontSize",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      スタイル
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateSelectedProperty(
                            "fontWeight",
                            selectedElement.fontWeight === "bold"
                              ? "normal"
                              : "bold"
                          )
                        }
                        className={`flex-1 py-1.5 text-xs border rounded ${
                          selectedElement.fontWeight === "bold"
                            ? "bg-zinc-800 text-white border-zinc-800"
                            : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                      >
                        B Bold
                      </button>
                    </div>
                  </div>
                </>
              )}

              {(selectedElement.type === "RECT" ||
                selectedElement.type === "CIRCLE" ||
                selectedElement.type === "IMAGE") && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="幅 (W)"
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) =>
                      updateSelectedProperty("width", parseInt(e.target.value))
                    }
                  />
                  <Input
                    label="高さ (H)"
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) =>
                      updateSelectedProperty("height", parseInt(e.target.value))
                    }
                  />
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-zinc-700">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={deleteSelected}
                  className="w-full"
                >
                  {ICONS.trash} 削除
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-10 text-sm flex flex-col items-center bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700">
              <span className="mb-2 text-2xl">👆</span>
              要素を選択すると
              <br />
              詳細が表示されます
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Input
              label="保存名"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                onClick={handleDownloadImage}
                size="sm"
                variant="secondary"
                disabled={!selectedSkuId}
                className="text-xs"
              >
                {ICONS.download} 画像 (PNG)
              </Button>
              <Button
                onClick={handleDownloadPDF}
                size="sm"
                variant="secondary"
                disabled={!selectedSkuId}
                className="text-xs"
              >
                📄 PDF保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      <Modal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        title="テンプレートとして保存"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            現在のキャンバスサイズ、レイアウト、配色を新しいテンプレートとして保存します。
          </p>
          <Input
            label="テンプレート名"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="例: A4横 セール用"
          />
          <Input
            label="説明"
            value={newTemplateDesc}
            onChange={(e) => setNewTemplateDesc(e.target.value)}
            placeholder="用途など"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsSaveTemplateModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!newTemplateName}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderHistoryView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {skuAssets.length > 0 ? (
        skuAssets.map((asset) => (
          <Card
            key={asset.id}
            className="!p-0 overflow-hidden flex flex-col group relative"
          >
            <div className="aspect-[1.414] bg-slate-100 dark:bg-slate-800 relative border-b border-zinc-100 dark:border-zinc-800">
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={asset.url}
                  download={asset.name}
                  className="px-4 py-2 bg-white text-zinc-900 rounded-full font-bold hover:bg-slate-200 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                >
                  ダウンロード
                </a>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900">
              <h4
                className="font-bold text-sm text-slate-800 dark:text-white truncate mb-1"
                title={asset.name}
              >
                {asset.name}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                作成日: {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300">
            {ICONS.palette}
          </div>
          <p>このSKUにはまだPOP履歴がありません。</p>
          <p className="text-sm mt-2">
            デザインタブから新しいPOPを作成してください。
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 gap-4 overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0">
          <h1 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
            {ICONS.palette}
            <span className="hidden sm:inline">POP Designer</span>
          </h1>

          {/* Tabs */}
          <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg flex gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("DESIGN")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === "DESIGN"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              デザイン
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
                activeTab === "HISTORY"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              履歴
              <span className="bg-slate-200 dark:bg-zinc-900 px-1.5 py-0.5 rounded-full text-[10px]">
                {skuAssets.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Branch Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 h-9 relative group">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              店舗
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent border-none text-xs font-medium w-32 focus:ring-0 p-0 text-zinc-700 dark:text-zinc-200 cursor-pointer appearance-none z-10"
            >
              <option value="">(共通マスタ)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <svg
              className="h-3 w-3 text-zinc-400 absolute right-2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* SKU Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 h-9 relative group">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              SKU
            </span>
            <select
              value={selectedSkuId}
              onChange={(e) => setSelectedSkuId(e.target.value)}
              className="bg-transparent border-none text-xs font-medium w-48 focus:ring-0 p-0 text-zinc-700 dark:text-zinc-200 cursor-pointer appearance-none z-10"
            >
              <option value="">SKUを選択...</option>
              {skus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <svg
              className="h-3 w-3 text-zinc-400 absolute right-2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {activeTab === "DESIGN" && (
            <>
              {/* Price */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 h-9 w-32">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  価格
                </span>
                <div className="flex items-center flex-1">
                  <span className="text-zinc-400 text-xs mr-1">¥</span>
                  <input
                    type="number"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(parseInt(e.target.value))}
                    className="bg-transparent border-none text-sm w-full text-right font-bold focus:ring-0 p-0 text-zinc-800 dark:text-white"
                    disabled={!selectedSku}
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={!selectedSkuId}
                size="sm"
                className="h-9 whitespace-nowrap shadow-none"
              >
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      {activeTab === "DESIGN" ? renderDesignView() : renderHistoryView()}
    </div>
  );
}
