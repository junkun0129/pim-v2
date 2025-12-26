export interface AttributeSet {
  id: string;
  name: string;
  attributeIds: string[];
  sharedAttributeIds?: string[]; // New: IDs of attributes that are defined at Series level
}

export type UseAttrSetProps = {
  attrSetList: AttributeSet[];
};
