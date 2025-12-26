export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export type UseCategoryProps = {
  categoryList: Category[];
};
