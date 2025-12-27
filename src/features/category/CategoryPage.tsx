import { useDataContext } from "@/src/components/providers/dataProvider";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { Category } from "@/src/entities/category/types";
import { useState } from "react";
import { CategoryNode } from "./components/CategoryNode";
import { ICONS } from "@/src/constants";
import CreateCategoryModal from "./components/CreateCategoryModal";

export default function CategoryPage() {
  const { categoryList } = useDataContext();
  const [searchTerm, setsearchTerm] = useState("");
  const [isCreateModalOpen, setisCreateModalOpen] = useState(false);
  const [selectedCategory, setselectedCategory] = useState<Category | null>(
    null
  );
  const filteredList = !searchTerm
    ? categoryList.filter((c) => !c.parentId)
    : categoryList.filter((i) => i.name.includes(searchTerm));
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-white font-['Plus_Jakarta_Sans']">
          カテゴリ
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Input
            icon={ICONS.search}
            onChange={(e) => setsearchTerm(e.target.value)}
          />
          <Button onClick={() => setisCreateModalOpen(true)}>新規登録</Button>
        </div>
      </div>
      <div className="space-y-2">
        {filteredList.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            allCategories={categoryList as Category[]}
            onDelete={() => console.log("has not been implement")}
            onEdit={(cat) => setselectedCategory(cat)}
            onAddChild={() => console.log("has not been implement")}
            canDelete={true}
            canEdit={true}
          />
        ))}
      </div>
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setisCreateModalOpen(false)}
        onSave={(category: { name: string; parentId?: string }) =>
          console.log("comming soon")
        }
        categories={categoryList}
        categoryToEdit={selectedCategory}
      />
    </div>
  );
}
