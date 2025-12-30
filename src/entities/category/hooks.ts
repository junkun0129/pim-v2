import { useState } from "react";
import { Category, CategoryOption } from "./types";
import { api } from "../api";

export const useCategoty = () => {
  const [categoryList, setcategoryList] = useState<Category[]>([]);

  const loadCategoryList = async () => {
    const rawList = await api.getCategoryList();
    setcategoryList(rawList);
  };

  return {
    categoryList,
    loadCategoryList,
  };
};
