import React, { useState, useMemo, useEffect, useRef } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import { ICONS } from "../src/constants";
import type {
  Attribute,
  AttributeSet,
  Category,
  Series,
  Sku,
  Permission,
  Asset,
} from "../src/types";
import Badge from "./ui/Badge";
import Select from "./ui/Select";
import { getCategoryPath } from "../utils";
import { api } from "../src/api";
import { APP_CONFIG } from "../src/config";

type Item = Category | Series | AttributeSet | Attribute;

interface GenericManagerProps {
  title: string;
  items: Item[];
  onAdd: (item: any) => void;
  onDelete: (id: string) => void;
  onUpdateAttributeSet?: (
    setId: string,
    attributeIds: string[],
    sharedAttributeIds: string[]
  ) => void;
  onUpdateSeries?: (series: Series) => void;
  onUpdateCategory?: (category: Category) => void;
  onViewSeries?: (seriesId: string) => void;
  dataMap?: {
    categories: Category[];
    attributes: Attribute[];
    attributeSets: AttributeSet[];
    series: Series[];
  };
  userPermissions: Permission[];
}

interface AttributeFilter {
  attributeId: string;
  value: string;
}

export default function GenericManager({
  title,
  items,
  onAdd,
  onDelete,
  onUpdateAttributeSet,
  onUpdateSeries,
  onUpdateCategory,
  onViewSeries,
  dataMap,
  userPermissions,
}: GenericManagerProps) {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Create/Edit Item State
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState(""); // For Attribute

  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<AttributeSet | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | undefined>(
    undefined
  );
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );

  // General Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Advanced Filter State for Series
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilter[]>(
    []
  );
  const [targetAttrId, setTargetAttrId] = useState("");
  const [targetAttrValue, setTargetAttrValue] = useState("");

  // Permissions
  const canCreate = userPermissions.includes("MASTER_CREATE");
  const canEdit = userPermissions.includes("MASTER_EDIT");
  const canDelete = userPermissions.includes("MASTER_DELETE");

  // Filter Items based on View
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Series specific advanced filters
      if (title === "シリーズ") {
        const series = item as Series;
        const categoryMatch = categoryFilter
          ? series.categoryIds.includes(categoryFilter)
          : true;
        if (!categoryMatch) return false;

        if (attributeFilters.length > 0) {
          const matchesAttributes = attributeFilters.every((filter) => {
            const val = series.attributeValues[filter.attributeId] || "";
            return val.toLowerCase().includes(filter.value.toLowerCase());
          });
          if (!matchesAttributes) return false;
        }
      }
      return true;
    });
  }, [items, searchTerm, title, categoryFilter, attributeFilters]);

  const handleSaveItem = () => {
    if (newItemName.trim()) {
      if (title === "属性") {
        onAdd({ name: newItemName, unit: newItemUnit });
      } else {
        onAdd({ name: newItemName });
      }
      setNewItemName("");
      setNewItemUnit("");
      setIsItemModalOpen(false);
    }
  };

  const handleSaveSeries = (seriesData: Omit<Series, "id" | "childSkuIds">) => {
    if (editingSeries && onUpdateSeries) {
      onUpdateSeries({ ...editingSeries, ...seriesData });
    } else {
      onAdd(seriesData);
    }
    setEditingSeries(undefined);
  };

  const handleSaveCategory = (catData: { name: string; parentId?: string }) => {
    if (editingCategory && onUpdateCategory) {
      onUpdateCategory({ ...editingCategory, name: catData.name });
    } else {
      onAdd(catData);
    }
    setEditingCategory(undefined);
  };

  // Helper for inline category creation from tree
  const handleAddChildCategory = (catData: {
    name: string;
    parentId: string;
  }) => {
    onAdd(catData);
  };

  const openSeriesCreate = () => {
    setEditingSeries(undefined);
    setIsItemModalOpen(true);
  };

  const openSeriesEdit = (series: Series) => {
    setEditingSeries(series);
    setIsItemModalOpen(true);
  };

  const openCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsItemModalOpen(true);
  };

  const openAttributeModal = (set: AttributeSet) => {
    setEditingSet(set);
    setIsAttributeModalOpen(true);
  };

  const handleUpdateAttributeSet = (
    updatedIds: string[],
    sharedIds: string[]
  ) => {
    if (editingSet && onUpdateAttributeSet) {
      onUpdateAttributeSet(editingSet.id, updatedIds, sharedIds);
    }
    setIsAttributeModalOpen(false);
    setEditingSet(null);
  };

  const singularTitle =
    title === "シリーズ"
      ? "シリーズ"
      : title.endsWith("s")
      ? title.slice(0, -1)
      : title;



  const isSimpleManager = title === "属性";

  return (
    
  );
}


