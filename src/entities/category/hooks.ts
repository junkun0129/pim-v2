import { useEffect, useState } from "react";
import { Category } from "./types";
import { api } from "../api";

export const useCategoty = () => {
  const [categoryList, setcategoryList] = useState<Category[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getCategoryList();
    setcategoryList(rawList);
  };
  return { categoryList };
};
