export interface Supplier {
  id: number;
  name: string;
  ruc: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  active: boolean;
}

// 👇 ESTE ES EL QUE FALTABA
export interface CreateSupplier {
  name: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
}
