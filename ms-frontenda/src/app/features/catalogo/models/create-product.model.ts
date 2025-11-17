// src/app/features/catalogo/models/create-product.model.ts
export interface CreateProduct {
  sku: string;
  name: string;
  unit: string | null;
  category: string | null;
  weight: number | null;
  description: string | null;
}
