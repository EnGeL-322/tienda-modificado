// src/app/features/compras/pages/purchase-form/purchase-form.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../services/purchase';
import {
  CreatePurchase,
  CreatePurchaseItem,
} from '../../models/create-purchase.model';
import { PurchaseOrder } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-form',
  standalone: false,
  templateUrl: './purchase-form.html',
  styleUrl: './purchase-form.scss',
})
export class PurchaseForm {
  supplierName = '';
  items: CreatePurchaseItem[] = [
    { productSku: '', quantity: 1, unitPrice: 0 },
  ];

  loading = false;
  error: string | null = null;
  success: string | null = null;

  lastOrder: PurchaseOrder | null = null;

  constructor(
    private purchaseService: PurchaseService,
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

  itemSubtotal(item: CreatePurchaseItem): number {
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
    if (!this.supplierName.trim()) {
      this.error = 'Ingrese el nombre del proveedor';
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
      this.error = 'Agregue al menos un producto válido a la compra';
      this.success = null;
      return;
    }

    const dto: CreatePurchase = {
      supplierName: this.supplierName.trim(),
      items: validItems.map((i) => ({
        productSku: i.productSku.trim(),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };

    this.loading = true;
    this.error = null;
    this.success = null;

    // CREA la compra (queda PENDING: aún no sube stock)
    this.purchaseService.create(dto).subscribe({
      next: (order) => {
        this.loading = false;
        this.lastOrder = order;
        this.success = `Orden de compra #${order.id} registrada (estado: ${order.status})`;
        // limpia "carrito"
        this.items = [{ productSku: '', quantity: 1, unitPrice: 0 }];
        this.supplierName = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo registrar la orden de compra';
      },
    });
  }

  goToDetail(): void {
    if (this.lastOrder) {
      this.router.navigate(['/compras', this.lastOrder.id]);
    }
  }
}
