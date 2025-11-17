import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleService } from '../../services/sale';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: false,
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.scss',
})
export class SaleList implements OnInit {
  sales: Sale[] = [];
  filtered: Sale[] = [];

  loading = false;
  error: string | null = null;
  search = '';

  constructor(
    private saleService: SaleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.loading = true;
    this.error = null;

    this.saleService.getAll().subscribe({
      next: (res) => {
        this.sales = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las ventas';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.search.toLowerCase().trim();

    if (!term) {
      this.filtered = [...this.sales];
      return;
    }

    this.filtered = this.sales.filter((s) => {
      const id = String(s.id ?? '').toLowerCase();
      const customer = (s.customerName ?? '').toLowerCase();
      const status = (s.status ?? '').toLowerCase();
      return (
        id.includes(term) ||
        customer.includes(term) ||
        status.includes(term)
      );
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  goToNew(): void {
    this.router.navigate(['/ventas/nueva']);
  }

  openDetail(sale: Sale): void {
    this.router.navigate(['/ventas', sale.id]);
  }

  saleTotal(sale: Sale): number {
    return sale.items?.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    ) ?? 0;
  }
}
