import { useEffect, useState } from "react";
import { User } from "./types";
import { api } from "../api";

export const useUser = () => {
  const [userList, setuserList] = useState<User[]>([]);
  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    const rawList = await api.getUserList();
    setuserList(rawList);
  };
  return { userList };
};
