import { PurchaseItemCreate } from './purchase-item-create.model';

export interface CreatePurchase {
  supplierId: number | null;
  items: PurchaseItemCreate[];
}
