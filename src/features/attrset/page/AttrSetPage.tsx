import { useDataContext } from "@/src/components/providers/dataProvider";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import { ICONS } from "@/src/constants";
import { AttributeSet } from "@/src/entities/attrset/type";
import { useState } from "react";
import AttributeSetEditModal from "../components/AttrSetEditModal";

export default function AttrSetPage() {
  const { attrSetList, attrList } = useDataContext();
  const [isCreateModalOpen, setisCreateModalOpen] = useState(false);
  const [selectedAttrSet, setselectedAttrSet] = useState<AttributeSet | null>(
    null
  );
  const [searchTerm, setsearchTerm] = useState("");
  const filteredList = searchTerm
    ? attrSetList.filter((i) => i.name.includes(searchTerm))
    : attrSetList;

  function handleEditButtonClick(set: AttributeSet) {
    setselectedAttrSet(set);
    setisCreateModalOpen(true);
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">
          属性セット
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Input
            icon={ICONS.search}
            onChange={(e) => setsearchTerm(e.target.value)}
          />
          <Button onClick={() => setisCreateModalOpen(true)}>新規登録</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredList.map((item) => {
          return (
            <Card key={item.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-lg text-slate-800 dark:text-white">
                    {item.name}
                  </span>
                  <Button
                    onClick={() => console.log("has not been ")}
                    variant="danger"
                    size="sm"
                  >
                    {ICONS.trash}
                  </Button>
                </div>
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    属性:
                  </h4>
                  {item.attributeIds.length > 0 ? (
                    <div className="flex flex-wrap items-start gap-1">
                      {item.attributeIds.map((attrId) => {
                        const isShared =
                          item.sharedAttributeIds?.includes(attrId);
                        const attr = attrList.find((a) => a.id === attrId);
                        return (
                          <Badge
                            key={attrId}
                            color={isShared ? "purple" : "gray"}
                            title={
                              isShared ? "シリーズ共通属性" : "SKU独自属性"
                            }
                          >
                            {attr?.name}
                            {attr?.unit ? ` (${attr.unit})` : ""}
                            {isShared && " ★"}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      属性がありません
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleEditButtonClick(item)}
                variant="secondary"
                size="sm"
                className="w-full mt-4"
              >
                属性を編集
              </Button>
            </Card>
          );
        })}
      </div>
      <AttributeSetEditModal
        set={selectedAttrSet}
        allAttributes={attrList}
        onSave={function (selectedIds: string[], sharedIds: string[]): void {
          console.log("");
        }}
        onClose={() => setisCreateModalOpen(false)}
        open={isCreateModalOpen}
      />
    </div>
  );
}
