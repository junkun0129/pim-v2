import { useEffect, useState } from "react";
import { User } from "../user/types";

export const useAuth = () => {
  const [me, setMe] = useState<User>({
    id: "user_full",
    name: "開発者 (全拡張)",
    avatarUrl: "https://placehold.co/100/3b82f6/ffffff?text=FULL",
    roleId: "role_admin",
    activeExtensions: ["OMS", "EC", "CREATIVE", "CATALOG", "PROJECT", "EXPORT"],
  });
  return { me };
};
