import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePurchase } from '../models/create-purchase.model';
import { PurchaseOrder } from '../models/purchase-order.model';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private baseUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  create(dto: CreatePurchase): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.baseUrl, dto);
  }

  addItem(orderId: number, item: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${orderId}/items`, item);
  }

  receive(orderId: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.baseUrl}/${orderId}/receive`, {});
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.baseUrl);
  }
}
