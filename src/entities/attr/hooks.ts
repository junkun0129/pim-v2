import { useEffect, useState } from "react";

import { api } from "../api";
import { Attribute } from "./type";

export const useAttr = () => {
  const [attrList, setattrList] = useState<Attribute[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getAttrList();
    setattrList(rawList);
  };
  return { attrList };
};
