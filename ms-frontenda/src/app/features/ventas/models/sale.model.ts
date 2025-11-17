export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface SaleItem {
  id: number;
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: number;
  customerName: string;
  status: SaleStatus;
  createdAt: string;
  completedAt: string | null;
  items: SaleItem[];
}
