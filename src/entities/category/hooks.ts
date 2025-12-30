import { useState } from "react";
import { Category, CategoryOption } from "./types";
import { api } from "../api";

export const useCategoty = () => {
  const [categoryList, setcategoryList] = useState<Category[]>([]);
  const [categoryOptionList, setcategoryOptionList] = useState<
    CategoryOption[]
  >([]);

  const getCategoryList = async () => {
    const rawList = await api.getCategoryList();
    setcategoryList(rawList);
  };

  async function getCategoryOptionList() {
    const rawList = await api.getCategoryOptionList();
    setcategoryOptionList(rawList);
  }
  return {
    categoryList,
    getCategoryList,
    getCategoryOptionList,
    categoryOptionList,
  };
};
