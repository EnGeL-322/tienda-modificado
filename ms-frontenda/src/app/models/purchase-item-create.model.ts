export interface PurchaseItemCreate {
  productSku: string;
  quantity: number;
  unitPrice: number;
  unitType: string;        // "UNIDAD", "MEDIA_CAJA", "CAJA", etc.
  unitsPerPackage: number; // cuántas unidades base trae esta presentación
}
