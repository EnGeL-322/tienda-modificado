// src/app/features/compras/models/create-purchase.model.ts

export interface CreatePurchaseItem {
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchase {
  supplierName: string;
  items: CreatePurchaseItem[];
}
