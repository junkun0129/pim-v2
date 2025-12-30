import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import LoginScreen from "./features/auth/LoginScreen";
import SkuPage from "./features/sku/page/SkuPage";
import { APP_ROUTES } from "./constants";
import CategoryPage from "./features/category/CategoryPage";
import AttrPage from "./features/attr/page/AttrPage";
import AttrSetPage from "./features/attrset/page/AttrSetPage";
import SkuDetailPage from "./features/sku/page/SkuDetailPage";
import OrderPage from "./features/order/OrderPage";

export default function App() {
  return (
    <Routes>
      {/* <Route
        path="login"
        element={
          <LoginScreen
            users={[]}
            onLogin={function (userId: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        }
      /> */}
      <Route element={<AppLayout />}>
        <Route path="/*" element={<div>home</div>}></Route>
        <Route path={APP_ROUTES.SKU} element={<SkuPage />} />
        <Route path={APP_ROUTES.SKU_DETAIL} element={<SkuDetailPage />} />
        <Route path={APP_ROUTES.SERIES} />
        <Route path={APP_ROUTES.ATTR} element={<AttrPage />} />
        <Route path={APP_ROUTES.ATTR_SET} element={<AttrSetPage />} />
        <Route path={APP_ROUTES.CATEGORY} element={<CategoryPage />} />
        <Route path={APP_ROUTES.ORDER} element={<OrderPage />} />
        <Route path="pop" />
        <Route path="project" />
        <Route path={APP_ROUTES.ROLE} />
        <Route path="notification" />
        <Route path="extention" />
        <Route path="ec" />
        <Route path="channel" />
        <Route path="catalog" />
      </Route>
    </Routes>
  );
}
