// src/app/features/compras/models/purchase-order.model.ts

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id: number;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: number;
  supplierName: string;
  status: PurchaseStatus;
  createdAt: string;
  receivedAt: string | null;
  items: PurchaseItem[];
}
