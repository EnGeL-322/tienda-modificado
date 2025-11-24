// src/app/features/compras/models/purchase-order.model.ts

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id: number;
  productSku: string;
  quantity: number;        // cantidad de presentaciones
  unitPrice: number;       // precio por presentación
  unitType: string;        // UNIDAD / MEDIA_CAJA / CAJA
  unitsPerPackage: number; // unidades base por presentación
}

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  supplierName: string;
  status: PurchaseStatus;        // mejor tipado que string
  createdAt: string;
  receivedAt?: string | null;   // 👈👈👈 AÑADIDO
  items: PurchaseItem[];         // usamos la interfaz de arriba
}
