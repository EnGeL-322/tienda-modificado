export interface Movement {
  id: number;
  productSku: string;
  quantity: number;
  type: 'ENTRADA' | 'SALIDA';
  reference: string | null;
  reason: string | null;
  createdAt: string; // ISO string
}
