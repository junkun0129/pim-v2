import { useDataContext } from "@/src/components/providers/dataProvider";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import { ICONS } from "@/src/constants";
import { useState } from "react";
import AttrCreateModal from "../components/AttrCreateModal";
import Input from "@/src/components/ui/Input";

export default function AttrPage() {
  const { attrList } = useDataContext();
  const [isCreateModalOpen, setisCreateModalOpen] = useState(false);
  const [searchTerm, setsearchTerm] = useState("");
  const filteredList = searchTerm
    ? attrList.filter((i) => i.name.includes(searchTerm))
    : attrList;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">
          属性
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
            <Card key={item.id} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 dark:text-white">
                  {item.name}
                </span>
                {item && item.unit && (
                  <span className="text-xs text-slate-400">
                    単位: {item.unit}
                  </span>
                )}
              </div>
              <Button
                onClick={() => console.log("comming soon")}
                variant="danger"
                size="sm"
              >
                {ICONS.trash}
              </Button>
            </Card>
          );
        })}
        <AttrCreateModal
          open={isCreateModalOpen}
          onClose={() => setisCreateModalOpen(false)}
          onSave={(attr) => console.log("comming soon")}
        />
      </div>
    </div>
  );
}
