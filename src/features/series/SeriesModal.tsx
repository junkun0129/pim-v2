const SeriesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (series: Omit<Series, "id" | "childSkuIds">) => void;
  dataMap: NonNullable<GenericManagerProps["dataMap"]>;
  seriesToEdit?: Series;
}> = ({ isOpen, onClose, onSave, dataMap, seriesToEdit }) => {
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [attributeSetIds, setAttributeSetIds] = useState<string[]>([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
  const [imageUrl, setImageUrl] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seriesToEdit) {
      setName(seriesToEdit.name);
      setCategoryIds(seriesToEdit.categoryIds);
      setAttributeSetIds(seriesToEdit.attributeSetIds);
      setAttributeValues(seriesToEdit.attributeValues);
      setImageUrl(seriesToEdit.imageUrl || "");
      setAssets(seriesToEdit.assets || []);
    } else {
      setName("");
      setCategoryIds([]);
      setAttributeSetIds([]);
      setAttributeValues({});
      setImageUrl("");
      setAssets([]);
    }
  }, [seriesToEdit, isOpen]);

  // Calculate "Shared" attributes based on selected sets
  // Only attributes marked as 'shared' in the sets should be editable here
  const sharedAttributes = useMemo(() => {
    if (!attributeSetIds.length) return [];
    const attrIds = new Set<string>();

    attributeSetIds.forEach((setId) => {
      const set = dataMap.attributeSets.find((s) => s.id === setId);
      if (set && set.sharedAttributeIds) {
        set.sharedAttributeIds.forEach((id) => attrIds.add(id));
      }
    });

    return Array.from(attrIds)
      .map((id) => dataMap.attributes.find((a) => a.id === id))
      .filter(Boolean) as Attribute[];
  }, [attributeSetIds, dataMap.attributeSets, dataMap.attributes]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (APP_CONFIG.useMockData) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }

      setIsUploading(true);
      try {
        const url = await api.uploadImage(file);
        setImageUrl(url);
      } catch (err) {
        console.error("Upload failed", err);
        alert("画像のアップロードに失敗しました。");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      try {
        const newAssets: Asset[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          let url = "";

          if (APP_CONFIG.useMockData) {
            url = URL.createObjectURL(file);
          } else {
            url = await api.uploadImage(file);
          }

          newAssets.push({
            id: `asset-${Date.now()}-${i}`,
            type: file.type.startsWith("image/")
              ? "IMAGE"
              : file.type.startsWith("video/")
              ? "VIDEO"
              : "FILE",
            name: file.name,
            url,
            createdAt: new Date().toISOString(),
            size: `${(file.size / 1024).toFixed(1)} KB`,
          });
        }
        setAssets((prev) => [...prev, ...newAssets]);
      } catch (err) {
        alert("アップロードに失敗しました");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    if (name) {
      onSave({
        name,
        categoryIds,
        attributeSetIds,
        attributeValues,
        imageUrl: imageUrl || undefined,
        assets,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={seriesToEdit ? "シリーズを編集" : "新規シリーズを追加"}
    >
      <div className="space-y-4">
        <Input
          label="シリーズ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            代表画像 (サムネイル)
          </label>
          <div className="mt-1 flex items-center gap-4">
            <span className="h-20 w-20 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="プレビュー"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </span>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              アセット (資料・動画等)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              + 追加
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAssetUpload}
            className="hidden"
            multiple
          />
          {assets.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded p-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between text-xs bg-slate-50 dark:bg-zinc-800 p-2 rounded"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Badge color="gray">{asset.type}</Badge>
                    <span className="truncate">{asset.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-50 dark:bg-zinc-800 p-2 rounded text-center">
              アセットなし
            </div>
          )}
        </div>

        <Select
          label="カテゴリ"
          multiple
          value={categoryIds}
          onChange={(e) =>
            setCategoryIds(
              Array.from(
                e.target.selectedOptions,
                (option: HTMLOptionElement) => option.value
              )
            )
          }
        >
          {dataMap.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {getCategoryPath(c.id, dataMap.categories)}
            </option>
          ))}
        </Select>
        <Select
          label="属性セット"
          multiple
          value={attributeSetIds}
          onChange={(e) =>
            setAttributeSetIds(
              Array.from(
                e.target.selectedOptions,
                (option: HTMLOptionElement) => option.value
              )
            )
          }
        >
          {dataMap.attributeSets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>

        {sharedAttributes.length > 0 && (
          <div className="space-y-3 pt-2 border-t dark:border-slate-600">
            <h4 className="font-semibold text-sm">共通属性値 (全SKUに適用)</h4>
            {sharedAttributes.map((attr) => (
              <div key={attr.id} className="flex items-center gap-2">
                <Input
                  label={`${attr.name} (${attr.unit || "-"})`}
                  value={attributeValues[attr.id] || ""}
                  onChange={(e) =>
                    setAttributeValues((prev) => ({
                      ...prev,
                      [attr.id]: e.target.value,
                    }))
                  }
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? "処理中..." : "保存"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};