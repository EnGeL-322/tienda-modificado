import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../services/purchase';
import { PurchaseOrder } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-list',
  standalone: false,
  templateUrl: './purchase-list.html',
  styleUrl: './purchase-list.scss',
})
export class PurchaseList implements OnInit {
  purchases: PurchaseOrder[] = [];
  filtered: PurchaseOrder[] = [];
  loading = false;
  error: string | null = null;

  search = '';
  statusFilter = '';

  constructor(
    private purchaseService: PurchaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.error = null;

    this.purchaseService.getAll().subscribe({
      next: (res) => {
        this.purchases = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las compras';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.search.toLowerCase().trim();
    const status = this.statusFilter;

    this.filtered = this.purchases.filter((p) => {
      const matchesText =
        !term ||
        p.supplierName.toLowerCase().includes(term) ||
        String(p.id).includes(term);

      const matchesStatus = !status || p.status === status;

      return matchesText && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value;
    this.applyFilter();
  }

  totalOf(p: PurchaseOrder): number {
    if (!p.items) return 0;
    return p.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
  }

  goToNew(): void {
    this.router.navigate(['/compras/nueva']);
  }

  goToDetail(p: PurchaseOrder): void {
    this.router.navigate(['/compras', p.id]);
  }
}
