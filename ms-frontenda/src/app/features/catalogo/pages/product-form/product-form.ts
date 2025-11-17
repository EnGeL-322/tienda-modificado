import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CreateProduct } from '../../models/create-product.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  // edición
  id: number | null = null;
  editing = false;

  // campos
  sku = '';
  name = '';
  unit: string | null = null;
  category: string | null = null;
  weight: number | null = null;
  description: string | null = null;
  active = true;

  // estado UI
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.editing = true;
      this.id = Number(paramId);
      this.loadProduct(this.id);
    }
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getById(id).subscribe({
      next: (p: Product) => {
        this.sku = p.sku;
        this.name = p.name;
        this.unit = p.unit;
        this.category = p.category;
        this.weight = p.weight;
        this.description = p.description;
        this.active = p.active;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el producto';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.sku.trim() || !this.name.trim()) {
      this.error = 'SKU y nombre son obligatorios';
      this.success = null;
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const dto: CreateProduct = {
      sku: this.sku.trim(),
      name: this.name.trim(),
      unit: this.unit || null,
      category: this.category || null,
      weight: this.weight ?? null,
      description: this.description || null,
    };

    const request$ =
      this.editing && this.id != null
        ? this.productService.update(this.id, dto) // PUT /products/{id}
        : this.productService.create(dto);         // POST /products

    request$.subscribe({
      next: () => {
        this.loading = false;
        // si quieres quedarte en el form, puedes mostrar success y quedarte
        // this.success = this.editing
        //   ? 'Producto actualizado correctamente'
        //   : 'Producto registrado correctamente';
        this.router.navigate(['/catalogo/productos']);
      },
      error: () => {
        this.loading = false;
        this.error = this.editing
          ? 'No se pudo actualizar el producto'
          : 'No se pudo registrar el producto';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/catalogo/productos']);
  }
}
