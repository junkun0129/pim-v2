import React from "react";
import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import LoginScreen from "./features/auth/LoginScreen";
import SkuPage from "./features/sku/page/SkuPage";
import { APP_ROUTES } from "./constants";

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
        <Route path={APP_ROUTES.SERIES} />
        <Route path={APP_ROUTES.ATTR} />
        <Route path={APP_ROUTES.ATTR_SET} />
        <Route path={APP_ROUTES.CATEGORY} />
        <Route path="order" />
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
  //   return (
  //     <GenericManager
  //       title={
  //         activeView === "Series"
  //           ? "シリーズ"
  //           : activeView === "Categories"
  //           ? "カテゴリ"
  //           : activeView === "Attributes"
  //           ? "属性"
  //           : "属性セット"
  //       }
  //       items={
  //         activeView === "Series"
  //           ? series
  //           : activeView === "Categories"
  //           ? categories
  //           : activeView === "Attributes"
  //           ? attributes
  //           : attributeSets
  //       }
  //       dataMap={{ categories, attributes, attributeSets, series }}
  //       onAdd={
  //         activeView === "Series"
  //           ? handleAddSeries
  //           : activeView === "Categories"
  //           ? handleAddCategory
  //           : activeView === "Attributes"
  //           ? handleAddAttribute
  //           : handleAddAttributeSet
  //       }
  //       onUpdateAttributeSet={
  //         activeView === "Attribute Sets" ? handleUpdateAttributeSet : undefined
  //       }
  //       onUpdateSeries={
  //         activeView === "Series" ? handleUpdateSeries : undefined
  //       }
  //       onUpdateCategory={
  //         activeView === "Categories" ? handleUpdateCategory : undefined
  //       }
  //       onDelete={
  //         activeView === "Series"
  //           ? handleDeleteSeries
  //           : activeView === "Categories"
  //           ? handleDeleteCategory
  //           : activeView === "Attributes"
  //           ? handleDeleteAttribute
  //           : handleDeleteAttributeSet
  //       }
  //       onViewSeries={(id) => {
  //         setSelectedSeriesId(id);
  //         setActiveView("SERIES_DETAIL");
  //       }}
  //       userPermissions={currentUserRole?.permissions || []}
  //     />
  //   );
  // };
}
