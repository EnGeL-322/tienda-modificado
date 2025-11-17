// src/app/features/catalogo/models/product.model.ts
export interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string | null;
  category: string | null;
  weight: number | null;
  description: string | null;
  active: boolean;
}
