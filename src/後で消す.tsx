// Export selected items if any, otherwise all filtered
const targetSkus =
  selectedSkuIds.size > 0
    ? skus.filter((s) => selectedSkuIds.has(s.id))
    : filteredSkus;

const headers = ["id", "name", "skuId", "barcode", "price", "imageUrl"];
const rows = targetSkus.map((sku) => {
  return [
    sku.id,
    `"${sku.name.replace(/"/g, '""')}"`,
    sku.skuId,
    sku.barcode || "",
    sku.price || 0,
    sku.imageUrl || "",
  ].join(",");
});

const csvContent = [headers.join(","), ...rows].join("\n");
const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.setAttribute(
  "download",
  `skus_export_${new Date().toISOString().split("T")[0]}.csv`
);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
