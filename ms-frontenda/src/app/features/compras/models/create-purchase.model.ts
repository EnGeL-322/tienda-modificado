// src/app/features/compras/models/create-purchase.model.ts

export interface CreatePurchaseItem {
  productSku: string;
  quantity: number;
  unitPrice: number;
  // NUEVO: presentación
  unitType: string;        // 'UNIDAD' | 'MEDIA_CAJA' | 'CAJA', etc.
  unitsPerPackage: number; // unidades base por presentación
}

export interface CreatePurchase {
  supplierId: number;
  items: CreatePurchaseItem[];
}
