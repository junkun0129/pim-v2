export interface Category {
  id: string;
  name: string;
  relativePaths: string[];
  createdAt: string;
  parentId?: string;
}
export type CategoryOption = {
  id: string;
  name: string;
  subtext: string;
  createdAt: string;
};

export type UseCategoryProps = {
  categoryList: Category[];
  categoryOptionList: CategoryOption[];
  getCategoryOptionList: () => void;
  getCategoryList: () => void;
};
