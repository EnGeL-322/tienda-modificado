import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory';
import { Inventory } from '../../models/inventory.model';
import { Movement } from '../../models/movement.model';

@Component({
  selector: 'app-inventory-detail',
  standalone: false,
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.scss',
})
export class InventoryDetail {
  sku = '';

  inventory: Inventory | null = null;
  movements: Movement[] = [];

  loadingStock = false;
  loadingMovements = false;
  error: string | null = null;

  constructor(private inventoryService: InventoryService) {}

  search(): void {
    this.error = null;
    this.inventory = null;
    this.movements = [];

    const term = this.sku.trim();
    if (!term) {
      this.error = 'Ingrese un SKU para buscar';
      return;
    }

    this.loadStock(term);
    this.loadMovements(term);
  }

  private loadStock(sku: string): void {
    this.loadingStock = true;

    this.inventoryService.getStock(sku).subscribe({
      next: (inv) => {
        this.inventory = inv;
        this.loadingStock = false;
      },
      error: () => {
        this.loadingStock = false;
        this.inventory = null;
        this.error = 'No se encontró stock para el SKU ingresado';
      },
    });
  }

  private loadMovements(sku: string): void {
    this.loadingMovements = true;

    this.inventoryService.getMovements(sku).subscribe({
      next: (moves) => {
        this.movements = moves;
        this.loadingMovements = false;
      },
      error: () => {
        this.movements = [];
        this.loadingMovements = false;
        // No sobreescribo error general para no tapar el de stock
      },
    });
  }

  // Para las badges de tipo ENTRADA / SALIDA
  badgeClass(type: Movement['type'] | string): string {
    const t = (type || '').toString().toUpperCase();
    if (t === 'ENTRADA') {
      return 'bg-success-subtle text-success fw-semibold';
    }
    if (t === 'SALIDA') {
      return 'bg-danger-subtle text-danger fw-semibold';
    }
    return 'bg-secondary-subtle text-secondary fw-semibold';
  }
}
