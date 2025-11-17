export interface StockUpdate {
  productSku: string;
  quantity: number;
  type: 'ENTRADA' | 'SALIDA';
  reference?: string | null;
  reason?: string | null;
}
