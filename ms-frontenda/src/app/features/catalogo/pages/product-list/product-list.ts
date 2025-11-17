import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product.model';

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

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: (res) => {
        this.products = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.loading = false;
      },
    });
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
