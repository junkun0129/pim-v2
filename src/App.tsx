import React from "react";
import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import LoginScreen from "./pages/auth/LoginScreen";
import SkuPage from "./pages/sku/SkuPage";
import { Sku } from "./types";

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
        <Route
          path="sku"
          element={
            <SkuPage
              skus={[]}
              dataMap={{
                series: [],
                categories: [],
                attributeSets: [],
                attributes: [],
              }}
              addSku={function (sku: Omit<Sku, "id">): void {
                throw new Error("Function not implemented.");
              }}
              updateSku={function (sku: Sku): void {
                throw new Error("Function not implemented.");
              }}
              deleteSku={function (id: string): void {
                throw new Error("Function not implemented.");
              }}
              onViewSku={function (skuId: string): void {
                throw new Error("Function not implemented.");
              }}
              userPermissions={[]}
            />
          }
        />
        <Route path="series" />
        <Route path="attr" />
        <Route path="attrset" />
        <Route path="category" />
        <Route path="order" />
        <Route path="pop" />
        <Route path="project" />
        <Route path="role" />
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
