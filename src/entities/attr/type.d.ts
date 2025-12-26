export interface Attribute {
  id: string;
  name: string;
  value: string;
  unit?: string; // New: Unit (e.g., cm, kg, GB)
}

export type UseAttrProps = {
  attrList: Attribute[];
};
