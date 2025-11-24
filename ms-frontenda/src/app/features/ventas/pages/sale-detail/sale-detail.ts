// src/app/features/ventas/pages/sale-detail/sale-detail.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../../services/sale';
import { Sale } from '../../models/sale.model';

import { AccountingService } from '../../../../services/accounting';
import { AccountingEntry } from '../../../../models/accounting.model';
import { environment } from '../../../../../environments/environment';
import { ProductService } from '../../../catalogo/services/product';
import { Product } from '../../../catalogo/models/product.model';

@Component({
  selector: 'app-sale-detail',
  standalone: false,
  templateUrl: './sale-detail.html',
  styleUrl: './sale-detail.scss',
})
export class SaleDetail implements OnInit {
  sale: Sale | null = null;
  loading = false;
  error: string | null = null;

  completing = false;
  completeError: string | null = null;

  // 👇 asientos contables ligados a esta venta
  accountingEntries: AccountingEntry[] = [];
  accountingLoading = false;
  accountingError: string | null = null;

  // 👇 datos de la empresa, solo front (boleta)
  companyName = environment.companyName;
  companyRuc = environment.companyRuc;
  companyAddress = environment.companyAddress;
  // 👇 mapa SKU → nombre
  productNameBySku: Record<string, string> = {};

  // 👉 Mapa simple de cuentas contables (Perú)
  private accountCodes: Record<string, string> = {
    'Caja': '10.1',
    'Bancos': '10.2',
    'Clientes': '12.1',
    'Inventarios': '20.1',
    'Mercaderías': '20.1',
    'Proveedores': '42.1',
    'Compras': '60.1',
    'Ventas': '70.1',
    'IGV crédito fiscal': '40.111',
    'IGV por pagar': '40.111',
  };

  constructor(
    private route: ActivatedRoute,
    private saleService: SaleService,
    private accountingService: AccountingService,
    private productService: ProductService     // 👈 nuevo

  ) {}

  getAccountCode(name?: string | null): string {
    if (!name) return '—';
    const key = name.trim();
    return this.accountCodes[key] ?? '—';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = 'ID de venta no proporcionado';
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.error = 'ID de venta inválido';
      return;
    }
    this.loadProductNames();   // 👈 NUEVO
    this.loadSale(id);
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
        this.productNameBySku = {};
      },
    });
  }

  getProductName(sku?: string | null): string {
    if (!sku) return '';
    return this.productNameBySku[sku] ?? '';
  }

  private loadSale(id: number): void {
    this.loading = true;
    this.error = null;

    this.saleService.getById(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.loading = false;

        // cuando tengo la venta, cargo sus asientos
        this.loadAccountingEntries(id);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar la venta';
      },
    });
  }

  private loadAccountingEntries(saleId: number): void {
    this.accountingLoading = true;
    this.accountingError = null;
    this.accountingEntries = [];

    this.accountingService.getByReference('SALE', saleId).subscribe({
      next: (entries) => {
        this.accountingEntries = entries;
        this.accountingLoading = false;
      },
      error: () => {
        this.accountingLoading = false;
        this.accountingError =
          'No se pudieron cargar los asientos contables de esta venta';
      },
    });
  }

  get total(): number {
    if (!this.sale) return 0;
    return this.sale.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
  }

  // 👉 IGV 18% sobre el subtotal
  get igv(): number {
    return this.total * 0.18;
  }

  // 👉 Total con IGV incluido
  get totalConIgv(): number {
    return this.total + this.igv;
  }

  canComplete(): boolean {
    return !!this.sale && this.sale.status === 'PENDING';
  }

  complete(): void {
    if (!this.sale || !this.canComplete()) return;

    this.completing = true;
    this.completeError = null;

    this.saleService.complete(this.sale.id).subscribe({
      next: (updated) => {
        this.sale = updated;
        this.completing = false;

        // refrescamos asientos si el backend genera otro asiento al completar
        this.loadAccountingEntries(updated.id);
      },
      error: () => {
        this.completing = false;
        this.completeError =
          'No se pudo completar la venta. Intente nuevamente.';
      },
    });
  }

  // 🔹 Solo front: imprimir la boleta
  print(): void {
    window.print();
  }

  // 🔹 Solo front: "descargar PDF" (por ahora mismo que imprimir)
  downloadPdf(): void {
    window.print(); // placeholder, igual que compras
  }
}
