import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateCustomer,
  Customer,
  TopCustomer,
} from '../../../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  create(dto: CreateCustomer): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, dto);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  searchByDni(dni: string): Observable<Customer> {
    const params = new HttpParams().set('dni', dni);
    return this.http.get<Customer>(`${this.baseUrl}/search`, { params });
  }

  // 🏆 TOP CLIENTES
  getTop(limit: number): Observable<TopCustomer[]> {
    return this.http
      .get<{
        customerId: number;
        dni: string;
        name: string;
        totalSales: number; // lo que devuelve el backend
      }[]>(`${this.baseUrl}/top`, {
        params: new HttpParams().set('limit', limit.toString()),
      })
      .pipe(
        map((response) =>
          response.map(
            (item): TopCustomer => ({
              customerId: item.customerId,
              dni: item.dni,
              name: item.name,
              // guardamos por si lo quieres usar en otro sitio
              totalSales: item.totalSales,
              // esto es lo que usas en el dashboard:
              salesCount: Number(item.totalSales) || 0,
              // de momento el backend no manda el monto, así que 0
              totalAmount: 0,
            })
          )
        )
      );
  }

  // obtener todos los clientes
  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
  }
}
