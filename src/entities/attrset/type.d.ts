import { Attribute } from "../attr/type";

export interface AttributeSet {
  id: string;
  name: string;
  uniqueAttrs: Attribute[];
  sharedAttrs?: Attribute[]; // New: IDs of attributes that are defined at Series level
}

export type UseAttrSetProps = {
  attrSetList: AttributeSet[];
  attrSetOptionList: AttrSetOption[];
  getAttrSetList: () => void;
  getAttrSetOptionList: () => void;
};

export type AttrSetOptionAttrItem = {
  id: string;
  name: string;
  unit?: string;
  isUnique: boolean;
};
export type AttrSetOption = {
  id: string;
  name: string;
  createdAt: string;
  attrs: AttrSetOptionAttrItem[];
};
