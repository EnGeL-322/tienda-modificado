import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SaleService } from '../../services/sale';
import {
  CreateSale,
  CreateSaleItem,
} from '../../models/create-sale.model';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-sale-cart',
  standalone: false,
  templateUrl: './sale-cart.html',
  styleUrl: './sale-cart.scss',
})
export class SaleCart {
  customerName = '';
  items: CreateSaleItem[] = [
    { productSku: '', quantity: 1, unitPrice: 0 },
  ];

  loading = false;
  error: string | null = null;
  success: string | null = null;

  lastSale: Sale | null = null;

  constructor(
    private saleService: SaleService,
    private router: Router
  ) {}

  addItem(): void {
    this.items.push({
      productSku: '',
      quantity: 1,
      unitPrice: 0,
    });
  }

  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.splice(index, 1);
  }

  itemSubtotal(item: CreateSaleItem): number {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return q * p;
  }

  get total(): number {
    return this.items.reduce(
      (acc, item) => acc + this.itemSubtotal(item),
      0
    );
  }

  submit(): void {
    if (!this.customerName.trim()) {
      this.error = 'Ingrese el nombre del cliente';
      this.success = null;
      return;
    }

    const validItems = this.items.filter(
      (i) =>
        i.productSku.trim() !== '' &&
        Number(i.quantity) > 0 &&
        Number(i.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      this.error = 'Agregue al menos un producto válido al carrito';
      this.success = null;
      return;
    }

    const dto: CreateSale = {
      customerName: this.customerName.trim(),
      items: validItems.map((i) => ({
        productSku: i.productSku.trim(),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };

    this.loading = true;
    this.error = null;
    this.success = null;

    this.saleService.create(dto).subscribe({
      next: (sale) => {
        this.loading = false;
        this.lastSale = sale;
        this.success = `Venta #${sale.id} registrada (estado: ${sale.status})`;
        // limpiar form
        this.items = [{ productSku: '', quantity: 1, unitPrice: 0 }];
        this.customerName = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo registrar la venta';
      },
    });
  }

  goToDetail(): void {
    if (this.lastSale) {
      this.router.navigate(['/ventas', this.lastSale.id]);
    }
  }
}
