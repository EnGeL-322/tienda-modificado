import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../services/purchase';
import { PurchaseOrder } from '../../models/purchase-order.model';
import {environment} from '../../../../../environments/environment';
import { ProductService } from '../../../catalogo/services/product';
import { Product } from '../../../catalogo/models/product.model';

@Component({
  selector: 'app-purchase-detail',
  standalone: false,
  templateUrl: './purchase-detail.html',
  styleUrl: './purchase-detail.scss',
})
export class PurchaseDetail implements OnInit {
  order: PurchaseOrder | null = null;

  loading = false;
  error: string | null = null;

  receiving = false;
  receiveError: string | null = null;

  // 👇 datos de la empresa, solo front (boleta)
  companyName = environment.companyName;
  companyRuc = environment.companyRuc;
  companyAddress = environment.companyAddress;

  // 👇 NUEVO: mapa SKU → nombre
  productNameBySku: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private productService: ProductService   // 👈 inyectamos
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = 'ID de compra no proporcionado';
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.error = 'ID de compra inválido';
      return;
    }
    // 👇 además de la orden, cargamos productos
    this.loadProductNames();
    this.loadOrder(id);
  }
  private loadProductNames(): void {
    this.productService.getAll().subscribe({
      next: (products: Product[]) => {
        this.productNameBySku = {};
        (products || []).forEach((p) => {
          if (p.sku) {
            this.productNameBySku[p.sku] = p.name ?? '';
          }
        });
      },
      error: () => {
        // si falla no rompemos nada, solo no habrá nombre
        this.productNameBySku = {};
      }
    });
  }
  getProductName(sku?: string | null): string {
    if (!sku) return '';
    return this.productNameBySku[sku] ?? '';
  }
  private loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la compra';
        this.loading = false;
      },
    });
  }

  get total(): number {
    if (!this.order) return 0;
    return this.order.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
  }
  // 👉 IGV 18% sobre el subtotal (total actual)
  get igv(): number {
    return this.total * 0.18;
  }

// 👉 Total con IGV incluido
  get totalConIgv(): number {
    return this.total + this.igv;
  }
  canReceive(): boolean {
    return !!this.order && this.order.status === 'PENDING' && !this.receiving;
  }

  receive(): void {
    if (!this.order || this.receiving) return;

    this.receiving = true;
    this.receiveError = null;

    this.purchaseService.receive(this.order.id).subscribe({
      next: (order) => {
        this.order = order;
        this.receiving = false;
      },
      error: () => {
        this.receiveError =
          'No se pudo marcar la compra como recibida. Intente nuevamente.';
        this.receiving = false;
      },
    });
  }
  // 🔹 Solo front: imprimir la boleta
  print(): void {
    window.print();
  }

  // 🔹 Solo front: "descargar PDF" (por ahora mismo que imprimir)
  // Si luego tienes backend que devuelve PDF, aquí lo conectas.
  downloadPdf(): void {
    window.print(); // placeholder visual
  }
}
