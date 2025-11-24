// src/app/services/accounting.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountingEntry,
  AccountingSummaryResponse,
  AccountBalanceResponse,
  AdjustmentRequest,
  PurchaseEntryRequest,
  SaleEntryRequest,
} from '../models/accounting.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountingService {

  // 👇 AJUSTA esta URL a cómo expongas el ms-inventory
  // Si tu gateway expone /api/accounting:
  private baseUrl = `${environment.apiUrl}/accounting`;
  // Si ya tenías el /api dentro de apiUrl, sería: `${environment.apiUrl}/accounting`

  constructor(private http: HttpClient) {}

  // ======= CONSULTAS =======

  getSummary(from: string, to: string): Observable<AccountingSummaryResponse> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<AccountingSummaryResponse>(`${this.baseUrl}/summary`, { params });
  }

  getEntries(from: string, to: string, type?: string): Observable<AccountingEntry[]> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (type) params = params.set('type', type);
    return this.http.get<AccountingEntry[]>(`${this.baseUrl}/entries`, { params });
  }

  getAccountBalance(account: string, from: string, to: string): Observable<AccountBalanceResponse> {
    const params = new HttpParams()
      .set('account', account)
      .set('from', from)
      .set('to', to);
    return this.http.get<AccountBalanceResponse>(`${this.baseUrl}/account-balance`, { params });
  }

  getById(id: number): Observable<AccountingEntry> {
    return this.http.get<AccountingEntry>(`${this.baseUrl}/${id}`);
  }

  getByReference(referenceType: string, referenceId: number): Observable<AccountingEntry[]> {
    const params = new HttpParams()
      .set('type', referenceType)
      .set('id', referenceId.toString());
    return this.http.get<AccountingEntry[]>(`${this.baseUrl}/by-reference`, { params });
  }

  // ======= CREACIÓN DE ASIENTOS =======

  createAdjustment(dto: AdjustmentRequest): Observable<AccountingEntry> {
    return this.http.post<AccountingEntry>(`${this.baseUrl}/adjustment`, dto);
  }

  createFromPurchase(dto: PurchaseEntryRequest): Observable<AccountingEntry> {
    return this.http.post<AccountingEntry>(`${this.baseUrl}/purchase`, dto);
  }

  createFromSale(dto: SaleEntryRequest): Observable<AccountingEntry> {
    return this.http.post<AccountingEntry>(`${this.baseUrl}/sale`, dto);
  }
}
