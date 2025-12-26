import { useAttr } from "@/src/entities/attr/hooks";
import { UseAttrProps } from "@/src/entities/attr/type";
import { useAttrSet } from "@/src/entities/attrset/hooks";
import { UseAttrSetProps } from "@/src/entities/attrset/type";
import { useCategoty } from "@/src/entities/category/hooks";
import { UseCategoryProps } from "@/src/entities/category/types";
import { UseUserProps } from "@/src/entities/user/types";
import { UseRoleProps } from "@/src/entities/role/types";
import { UseAuthProps } from "@/src/entities/auth/types";
import { useSeries } from "@/src/entities/series/hooks";
import { UseSeriesProps } from "@/src/entities/series/types";
import { useSku } from "@/src/entities/sku/hooks";
import { UseSkuProps } from "@/src/entities/sku/types";
import { createContext, useContext } from "react";
import { useRole } from "@/src/entities/role/hooks";
import { useUser } from "@/src/entities/user/hooks";
import { useAuth } from "@/src/entities/auth/hooks";

const DataContext = createContext<
  | (UseSkuProps &
      UseSeriesProps &
      UseCategoryProps &
      UseAttrProps &
      UseAttrSetProps &
      UseUserProps &
      UseRoleProps &
      UseAuthProps)
  | undefined
>(undefined);

export function DataProvider({ children }) {
  const skuHooks = useSku();
  const categoryHooks = useCategoty();
  const attrHooks = useAttr();
  const attrSetHooks = useAttrSet();
  const seriesHooks = useSeries();
  const roleHooks = useRole();
  const userHooks = useUser();
  const authHooks = useAuth();

  return (
    <DataContext.Provider
      value={{
        ...skuHooks,
        ...categoryHooks,
        ...attrSetHooks,
        ...attrHooks,
        ...seriesHooks,
        ...roleHooks,
        ...userHooks,
        ...authHooks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("DataProvider initial error");
  }
  return context;
}
