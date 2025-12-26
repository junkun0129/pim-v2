import { useEffect, useState } from "react";
import { api } from "../api";
import { AttributeSet } from "./type";

export const useAttrSet = () => {
  const [attrSetList, setattrSetList] = useState<AttributeSet[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getAttrSetList();
    setattrSetList(rawList);
  };
  return { attrSetList };
};
