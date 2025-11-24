export interface CreateProduct {
  sku: string | null;
  name: string;
  unit: string | null;
  category: string | null;
  description: string | null;
  unitsPerBox: number | null;
  unitsPerPack: number | null;
}
