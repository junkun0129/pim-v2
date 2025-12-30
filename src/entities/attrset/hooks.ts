import { useEffect, useState } from "react";
import { api } from "../api";
import { AttributeSet, AttrSetOption } from "./type";

export const useAttrSet = () => {
  const [attrSetList, setattrSetList] = useState<AttributeSet[]>([]);
  const [attrSetOptionList, setattrSetOptionList] = useState<AttrSetOption[]>(
    []
  );

  const getAttrSetList = async () => {
    const rawList = await api.getAttrSetList();
    setattrSetList(rawList);
  };
  const getAttrSetOptionList = async () => {
    const rawList = await api.getAttrSetOptionList();
    setattrSetOptionList(rawList);
  };
  return {
    attrSetList,
    attrSetOptionList,
    getAttrSetList,
    getAttrSetOptionList,
  };
};
