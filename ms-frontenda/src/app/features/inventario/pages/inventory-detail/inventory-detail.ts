import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory';
import { Inventory } from '../../models/inventory.model';
import { Movement } from '../../models/movement.model';

// Productos del catálogo
import { Product } from '../../../catalogo/models/product.model';
import { ProductService } from '../../../catalogo/services/product';

@Component({
  selector: 'app-inventory-detail',
  standalone: false,
  templateUrl: './inventory-detail.html',
  styleUrls: ['./inventory-detail.scss'],
})
export class InventoryDetail implements OnInit {
  // Búsqueda
  sku = '';

  // Datos de inventario
  inventory: Inventory | null = null;
  movements: Movement[] = [];

  // Productos (para selector)
  products: Product[] = [];
  loadingProducts = false;
  currentProduct: Product | null = null;

  // Filtro de movimientos
  movementTypeFilter: 'ALL' | 'ENTRADA' | 'SALIDA' = 'ALL';

  loadingStock = false;
  loadingMovements = false;
  error: string | null = null;

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Cargar lista de productos para el combo
  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.loadingProducts = false;
        this.products = products;

        // Si ya hay inventario cargado y no tenemos producto seleccionado, intentar encontrarlo
        if (this.inventory && !this.currentProduct) {
          this.currentProduct =
            this.products.find((p) => p.sku === this.inventory!.productSku) ||
            null;
        }
      },
      error: (err) => {
        this.loadingProducts = false;
        console.error('No se pudieron cargar los productos para inventario', err);
      },
    });
  }

  // Buscar por SKU (input o combo)
  search(): void {
    this.error = null;
    this.inventory = null;
    this.movements = [];
    this.currentProduct = null;
    this.movementTypeFilter = 'ALL';

    const term = this.sku.trim();
    if (!term) {
      this.error = 'Ingrese un SKU para buscar';
      return;
    }

    this.loadStock(term);
    this.loadMovements(term);
  }

  // Elegir producto desde el selector
  onProductSelectChange(sku: string): void {
    const trimmed = (sku || '').trim();
    if (!trimmed) {
      return;
    }
    this.sku = trimmed;
    this.search();
  }

  private loadStock(sku: string): void {
    this.loadingStock = true;

    this.inventoryService.getStock(sku).subscribe({
      next: (inv) => {
        this.inventory = inv;
        this.loadingStock = false;

        // Intentar obtener info del producto (nombre, etc.)
        this.currentProduct =
          this.products.find((p) => p.sku === inv.productSku) || null;
      },
      error: () => {
        this.loadingStock = false;
        this.inventory = null;
        this.currentProduct = null;
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
        // no piso error general
      },
    });
  }

  // Movimientos filtrados según tipo
  get filteredMovements(): Movement[] {
    if (this.movementTypeFilter === 'ALL') {
      return this.movements;
    }
    const type = this.movementTypeFilter;
    return this.movements.filter(
      (m) => (m.type || '').toString().toUpperCase() === type
    );
  }

  // Totales de movimientos
  get totalEntradas(): number {
    return this.movements
      .filter((m) => (m.type || '').toString().toUpperCase() === 'ENTRADA')
      .reduce((acc, m) => acc + (Number(m.quantity) || 0), 0);
  }

  get totalSalidas(): number {
    return this.movements
      .filter((m) => (m.type || '').toString().toUpperCase() === 'SALIDA')
      .reduce((acc, m) => acc + (Number(m.quantity) || 0), 0);
  }

  get saldoCalculado(): number {
    return this.totalEntradas - this.totalSalidas;
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
