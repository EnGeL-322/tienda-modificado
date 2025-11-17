// src/app/features/compras/pages/purchase-detail/purchase-detail.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../services/purchase';
import { PurchaseOrder } from '../../models/purchase-order.model';

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

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error = 'ID de compra no proporcionado';
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.error = 'ID de compra inválido';
      return;
    }

    this.loadOrder(id);
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
        this.loading = false;
        this.error = 'No se pudo cargar la compra';
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

  canReceive(): boolean {
    return !!this.order && this.order.status === 'PENDING';
  }

  receive(): void {
    if (!this.order) return;
    this.receiving = true;
    this.receiveError = null;

    this.purchaseService.receive(this.order.id).subscribe({
      next: (updated) => {
        this.order = updated;
        this.receiving = false;
      },
      error: () => {
        this.receiving = false;
        this.receiveError =
          'No se pudo marcar la compra como recibida. Intente nuevamente.';
      },
    });
  }
}
