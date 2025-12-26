import { Category } from "./entities/category/types";

export const getCategoryPath = (
  catId: string,
  categories: Category[]
): string => {
  const cat = categories.find((c) => c.id === catId);
  if (!cat) return "";
  if (!cat.parentId) return cat.name;
  return `${getCategoryPath(cat.parentId, categories)} > ${cat.name}`;
};
