import { User } from "../user/types";

export type ExtensionType =
  | "OMS"
  | "EC"
  | "CREATIVE"
  | "CATALOG"
  | "PROJECT"
  | "EXPORT";

export type UseAuthProps = {
  me: User;
};
