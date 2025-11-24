// src/app/features/ventas/models/create-sale.model.ts
export interface CreateSale {
  customerId: number;
  items: CreateSaleItem[];
}


export interface CreateSaleItem {
  productSku: string;
  quantity: number;
  unitPrice: number;
  unitType: 'UNIDAD' | 'MEDIA_CAJA' | 'CAJA';
  unitsPerPackage: number;
}
