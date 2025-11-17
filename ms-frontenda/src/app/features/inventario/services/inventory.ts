import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Inventory } from '../models/inventory.model';
import { Movement } from '../models/movement.model';
import { StockUpdate } from '../models/stock-update.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getStock(sku: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/${sku}`);
  }

  getMovements(sku: string): Observable<Movement[]> {
    return this.http.get<Movement[]>(`${this.baseUrl}/movements/${sku}`);
  }

  updateStock(dto: StockUpdate): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/update`, dto);
  }
}
