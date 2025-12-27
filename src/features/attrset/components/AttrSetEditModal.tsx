import Button from "@/src/components/ui/Button";
import Modal from "@/src/components/ui/Modal";
import Select from "@/src/components/ui/Select";
import { Attribute } from "@/src/entities/attr/type";
import { AttributeSet } from "@/src/entities/attrset/type";
import { useState } from "react";

type Props = {
  set?: AttributeSet;
  allAttributes: Attribute[];
  onSave: (selectedIds: string[], sharedIds: string[]) => void;
  onClose: () => void;
  open: boolean;
};
export default function AttributeSetEditModal({
  set,
  allAttributes,
  onSave,
  onClose,
  open,
}: Props) {
  const [selectedIds, setSelectedIds] = useState(set?.attributeIds);
  const [sharedIds, setSharedIds] = useState(set?.sharedAttributeIds || []);

  const handleSave = () => {
    onSave(selectedIds, sharedIds);
  };

  const toggleShared = (id: string) => {
    if (sharedIds.includes(id)) {
      setSharedIds((prev) => prev.filter((sid) => sid !== id));
    } else {
      setSharedIds((prev) => [...prev, id]);
    }
  };

  // Filter attributes that are currently selected to show in the shared toggle list
  const selectedAttributes = allAttributes.filter((a) =>
    selectedIds?.includes(a.id)
  );

  return (
    <Modal isOpen={open} onClose={onClose} title={"属性セットの新規作成・編集"}>
      <div className="space-y-6">
        <div>
          <Select
            label="利用可能な属性 (全選択)"
            multiple
            value={selectedIds}
            onChange={(e) =>
              setSelectedIds(
                Array.from(
                  e.target.selectedOptions,
                  (opt: HTMLOptionElement) => opt.value
                )
              )
            }
            className="h-40"
          >
            {allAttributes.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.name}
              </option>
            ))}
          </Select>
        </div>

        {selectedAttributes.length > 0 && (
          <div className="border-t pt-4 dark:border-zinc-700">
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">
              シリーズ共通属性の設定
            </label>
            <p className="text-xs text-slate-400 mb-3">
              チェックを入れた属性はシリーズ作成時に値を設定し、全SKUで共有されます。
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-zinc-200 dark:border-zinc-700 rounded p-2">
              {selectedAttributes.map((attr) => (
                <label
                  key={attr.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={sharedIds.includes(attr.id)}
                    onChange={() => toggleShared(attr.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {attr.name}
                  </span>
                  {attr.unit && (
                    <span className="text-xs text-slate-400">
                      ({attr.unit})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </Modal>
  );
}
