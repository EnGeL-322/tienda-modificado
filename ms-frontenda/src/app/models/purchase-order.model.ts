import {PurchaseItem} from '../features/compras/models/purchase-order.model';

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: number;
  supplierId: number | null;
  supplierName: string | null;
  status: PurchaseStatus;
  createdAt: string;     // o Date si luego lo parseas
  receivedAt?: string | null;
  items: PurchaseItem[];
}
