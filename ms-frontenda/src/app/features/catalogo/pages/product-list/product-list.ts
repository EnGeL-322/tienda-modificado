import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.model';
import {InventoryService} from '../../../inventario/services/inventory';
import {Inventory} from '../../../inventario/models/inventory.model';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  loading = false;
  error: string | null = null;
  search = '';


  stockBySku: { [sku: string]: number } = {};


  constructor(
    private productService: ProductService,
    private router: Router,
    private inventoryService: InventoryService, // 👈 inyectamos inventario
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  // Puedes ajustar estos límites si quieres
  private getStockQty(p: Product): number {
    return (this.stockBySku && this.stockBySku[p.sku] != null)
      ? this.stockBySku[p.sku]
      : 0;
  }

  availabilityLabel(p: Product): string {
    const qty = this.getStockQty(p);

    if (qty <= 0) {
      return 'Desabastecimiento';
    }
    if (qty > 0 && qty <= 5) {
      return 'Stock bajo';
    }
    // aquí puedes poner "Disponible", "Suficiente", etc.
    return 'Disponible';
  }

  availabilityClass(p: Product): string {
    const qty = this.getStockQty(p);

    if (qty <= 0) {
      return 'badge-status-danger';
    }
    if (qty > 0 && qty <= 5) {
      return 'badge-status-warning';
    }
    return 'badge-status-success';
  }

  availabilityDotClass(p: Product): string {
    const qty = this.getStockQty(p);

    if (qty <= 0) {
      return 'dot-danger';
    }
    if (qty > 0 && qty <= 5) {
      return 'dot-warning';
    }
    return 'dot-success';
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: (res) => {
        this.products = res;
        this.applyFilter();
        this.loading = false;

        this.loadStocks(); // 👈 AQUÍ
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.loading = false;
      },
    });
  }
  // 👇 NUEVO
  loadStocks(): void {
    this.stockBySku = {};

    this.products.forEach((p) => {
      if (!p.sku) {
        return;
      }

      this.inventoryService.getStock(p.sku).subscribe({
        next: (inv: Inventory) => {
          this.stockBySku[p.sku] = inv.quantity;
        },
        error: () => {
          // si no hay stock registrado devolvemos 0 o lo que quieras mostrar
          this.stockBySku[p.sku] = 0;
        },
      });
    });
  }

  stockLabel(p: Product): string {
    const total = this.stockBySku[p.sku];
    if (total === undefined) return '—';

    const unitsPerBox = p.unitsPerBox ?? 0;

    if (!unitsPerBox || unitsPerBox <= 1) {
      return `${total} ${p.unit ?? 'unid.'}`;
    }

    const cajas = Math.floor(total / unitsPerBox);
    const sueltas = total % unitsPerBox;

    if (cajas === 0) {
      return `${sueltas} ${p.unit ?? 'unid.'}`;
    }

    return `${cajas} caja(s) y ${sueltas} ${p.unit ?? 'unid.'} (${total} unidades)`;
  }


  applyFilter(): void {
    const term = this.search.toLowerCase().trim();
    if (!term) {
      this.filtered = [...this.products];
      return;
    }

    this.filtered = this.products.filter((p) =>
      (p.name ?? '').toLowerCase().includes(term) ||
      (p.sku ?? '').toLowerCase().includes(term) ||
      (p.category ?? '').toLowerCase().includes(term)
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  goToNew(): void {
    // 👈 importante: ruta correcta según tu AppRoutingModule
    this.router.navigate(['/catalogo/productos/nuevo']);
  }

  edit(p: Product): void {
    if (!p.id) return;
    // 👈 abre el mismo formulario pero en modo edición
    this.router.navigate(['/catalogo/productos', p.id]);
  }

  toggleActive(p: Product): void {
    if (!p.id) return;

    const newActive = !p.active;

    this.productService.changeActive(p.id, newActive).subscribe({
      next: (updated) => {
        // sincronizamos con lo que devuelve el backend
        p.active = updated.active;
      },
      error: () => {
        alert('No se pudo cambiar el estado del producto');
      },
    });
  }

}
