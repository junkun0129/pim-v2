import { useEffect, useState } from "react";
import { api } from "../api";
import { Role } from "./types";

export const useRole = () => {
  const [roleList, setroleList] = useState<Role[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getRoleList();
    setroleList(rawList);
  };
  return { roleList };
};
