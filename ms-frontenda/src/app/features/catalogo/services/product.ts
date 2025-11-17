import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { CreateProduct } from '../models/create-product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/sku/${sku}`);
  }

  create(dto: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, dto);
  }

  update(id: number, dto: CreateProduct): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, dto);
  }

  changeActive(id: number, active: boolean): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/active`, { active });
  }
}
