import { useEffect, useState } from "react";
import { api } from "../api";
import { AttributeSet, AttrSetOption } from "./type";

export const useAttrSet = () => {
  const [attrSetList, setattrSetList] = useState<AttributeSet[]>([]);

  const loadAttrSetList = async () => {
    const rawList = await api.getAttrSetList();
    setattrSetList(rawList);
  };

  return {
    attrSetList,
    loadAttrSetList,
  };
};
