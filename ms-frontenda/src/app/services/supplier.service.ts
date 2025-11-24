import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private baseUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/${id}`);
  }

  create(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, supplier);
  }

  update(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/${id}`, supplier);
  }

  changeActive(id: number, active: boolean | null = null): Observable<Supplier> {
    return this.http.patch<Supplier>(`${this.baseUrl}/${id}/active`, active);
  }
}
