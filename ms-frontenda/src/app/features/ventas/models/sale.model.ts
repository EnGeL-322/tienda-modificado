export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface SaleItem {
  id: number;
  productSku: string;
  quantity: number;        // cantidad de presentaciones (ej: 2 cajas)
  unitPrice: number;       // precio por presentación
  unitType: string;        // UNIDAD / MEDIA_CAJA / CAJA
  unitsPerPackage: number; // unidades base por presentación
}

export interface Sale {
  id: number;
  customerName: string;
  status: SaleStatus;
  createdAt: string;
  completedAt: string | null;
  items: SaleItem[];
}
