// src/app/features/compras/services/purchase.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PurchaseOrder } from '../models/purchase-order.model';
import { CreatePurchase } from '../models/create-purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly baseUrl = `${environment.apiUrl}/purchases`;
  // 👆 MUY IMPORTANTE: que apunte al mismo /purchases del backend

  constructor(private http: HttpClient) {}

  create(dto: CreatePurchase): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.baseUrl, dto);
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  receive(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${id}/receive`, {});
  }

  getAll(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.baseUrl);
  }
}
