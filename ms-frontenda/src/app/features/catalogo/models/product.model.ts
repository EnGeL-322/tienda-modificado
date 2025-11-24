export interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string | null;
  category: string | null;
  description: string | null;
  active: boolean;
  unitsPerBox: number | null;
  unitsPerPack: number | null;
}
