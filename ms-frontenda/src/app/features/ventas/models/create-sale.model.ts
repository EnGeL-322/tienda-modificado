export interface CreateSaleItem {
  productSku: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSale {
  customerName: string;
  items: CreateSaleItem[];
}
