import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../../services/sale';
import { Sale } from '../../models/sale.model';

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

  constructor(
    private route: ActivatedRoute,
    private saleService: SaleService
  ) {}

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

    this.loadSale(id);
  }

  private loadSale(id: number): void {
    this.loading = true;
    this.error = null;

    this.saleService.getById(id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo cargar la venta';
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
      },
      error: () => {
        this.completing = false;
        this.completeError =
          'No se pudo completar la venta. Intente nuevamente.';
      },
    });
  }
}
