// src/app/models/accounting.model.ts

export interface AccountingEntry {
  id: number;
  date: string;         // ISO
  type: 'COMPRA' | 'VENTA' | 'AJUSTE' | string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceType: string; // "SALE" | "PURCHASE" | ...
  referenceId: number;
  description?: string;
}

export interface AccountingSummaryResponse {
  from: string;
  to: string;
  totalPurchases: number;
  totalSales: number;
  totalAdjustments: number;
  profit: number;
}

export interface AccountBalanceResponse {
  account: string;
  from: string;
  to: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface AdjustmentRequest {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  description?: string;
}

// 👉 NUEVOS
export interface PurchaseEntryRequest {
  purchaseId: number;
  amount: number;
}

export interface SaleEntryRequest {
  saleId: number;
  amount: number;
}
