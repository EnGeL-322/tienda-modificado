// src/app/models/customer.model.ts
export interface Customer {
  id: number;
  dni: string;
  name: string;
  phone?: string;
}

export interface CreateCustomer {
  dni: string;
  name: string;
  phone?: string;
}

// 👇 este es el que usa el dashboard
export interface TopCustomer {
  customerId: number;
  dni?: string;
  name: string;

  // opcional: viene del backend como COUNT(s.id)
  totalSales?: number;

  // campos que SÍ usas en el HTML
  salesCount: number;   // cantidad de ventas
  totalAmount: number;  // monto total (por ahora lo rellenamos desde el front)
}
