import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateSale } from '../models/create-sale.model';
import { Sale } from '../models/sale.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  create(dto: CreateSale): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, dto);
  }

  complete(id: number): Observable<Sale> {
    return this.http.post<Sale>(`${this.baseUrl}/${id}/complete`, {});
  }

  getById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }

  // opcional, por si luego quieres listar todas
  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.baseUrl);
  }
}
