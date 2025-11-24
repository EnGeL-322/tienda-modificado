// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../auth/auth';

// VENTAS
import { SaleService } from '../../features/ventas/services/sale';
import { Sale } from '../../features/ventas/models/sale.model';

// COMPRAS
import { PurchaseService } from '../../features/compras/services/purchase';
import { PurchaseOrder } from '../../features/compras/models/purchase-order.model';

// PRODUCTOS
import { ProductService } from '../../features/catalogo/services/product';
import { Product } from '../../features/catalogo/models/product.model';

// CLIENTES (para TOP con DNI)
import { CustomerService } from '../../features/ventas/services/customer';
import { TopCustomer } from '../../models/customer.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  // Estado carga/error
  loadingSales = false;
  salesError: string | null = null;

  // === VENTAS ===
  totalSalesCount = 0;
  totalSalesAmount = 0;

  // Top productos (ahora incluye nombre)
  topProducts: {
    sku: string;
    name: string;
    totalUnits: number;
    totalAmount: number;
  }[] = [];

  // Top clientes (usando TopCustomer del backend → incluye DNI)
  topCustomers: TopCustomer[] = [];

  // === COMPRAS ===
  totalPurchasesAmount = 0;

  // === UTILIDAD ESTIMADA ===
  totalCostOfSold = 0;
  estimatedProfit = 0;

  // Comparativo compras vs ventas por producto
  productComparative: {
    sku: string;
    name: string;
    unitsPurchased: number;
    costPurchased: number;
    unitsSold: number;
    revenue: number;
    costOfSold: number;
    profit: number;
    marginPct: number;
  }[] = [];

  // Para las barras del mini-gráfico
  maxUnitsSold = 1;
  maxRevenue = 1;

  // Mapa SKU → nombre de producto
  private productNameBySku: Record<string, string> = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private saleService: SaleService,
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private customerService: CustomerService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // ================== CARGA STATS ==================
  private loadStats(): void {
    this.loadingSales = true;
    this.salesError = null;

    forkJoin({
      sales: this.saleService.getAll(),
      purchases: this.purchaseService.getAll(),
      products: this.productService.getAll(),
      topCustomers: this.customerService.getTop(5),
    }).subscribe({
      next: ({ sales, purchases, products, topCustomers }) => {
        this.loadingSales = false;

        // Mapa SKU → nombre de producto
        this.productNameBySku = {};
        (products || []).forEach((p: Product) => {
          if (p.sku) {
            this.productNameBySku[p.sku] = p.name ?? '';
          }
        });

        // Totales de ventas
        this.totalSalesCount = sales.length;
        this.totalSalesAmount = sales.reduce(
          (acc, s) => acc + this.getSaleTotal(s),
          0
        );

        // Totales de compras
        this.totalPurchasesAmount = purchases.reduce(
          (acc, p) => acc + this.getPurchaseTotal(p),
          0
        );

        // Top clientes (ya viene con DNI, nombre y totalSales)
        this.topCustomers = topCustomers || [];

        // Cálculo detallado por producto
        this.calculateStats(sales, purchases);
      },
      error: () => {
        this.loadingSales = false;
        this.salesError =
          'No se pudieron cargar las estadísticas de compras/ventas';
      },
    });
  }
  getKpiPercent(type: 'sales' | 'purchases' | 'profit'): number {
    const sales = Math.max(this.totalSalesAmount, 0);
    const purchases = Math.max(this.totalPurchasesAmount, 0);
    const profit = Math.max(this.estimatedProfit, 0);

    const total = sales + purchases + profit;
    if (total <= 0) {
      return 0;
    }

    const map: Record<string, number> = {
      sales,
      purchases,
      profit,
    };

    return (map[type] / total) * 100;
  }
  getSalesPurchasePieBackground(): string {
    const sales = Math.max(this.totalSalesAmount, 0);
    const purchases = Math.max(this.totalPurchasesAmount, 0);
    const total = sales + purchases;

    if (total <= 0) {
      return '#e9ecef'; // gris clarito sin datos
    }

    const salesPct = (sales / total) * 100;
    // usamos dos colores tipo Bootstrap: azul y gris
    return `conic-gradient(#0d6efd 0 ${salesPct}%, #6c757d ${salesPct}% 100%)`;
  }
  private getSaleTotal(s: Sale): number {
    if (!s.items) return 0;
    return s.items.reduce((acc, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      return acc + qty * price;
    }, 0);
  }

  private getPurchaseTotal(p: PurchaseOrder): number {
    const items = (p as any).items as
      | {
      quantity: number;
      unitPrice: number;
      unitsPerPackage?: number;
    }[]
      | undefined;

    if (!items) return 0;

    return items.reduce((acc, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      return acc + qty * price;
    }, 0);
  }

  // ================== CÁLCULOS PRINCIPALES ==================
  private calculateStats(sales: Sale[], purchases: PurchaseOrder[]): void {
    const productSalesMap = new Map<
      string,
      { unitsSold: number; revenue: number }
    >();
    const productPurchMap = new Map<
      string,
      { unitsPurchased: number; costPurchased: number }
    >();

    // ----- Ventas -----
    for (const s of sales) {
      if (!s.items) continue;

      for (const it of s.items) {
        const sku = it.productSku;
        if (!sku) continue;

        const units =
          (Number(it.quantity) || 0) *
          (Number((it as any).unitsPerPackage ?? 1) || 1);
        const amount =
          (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);

        let ps = productSalesMap.get(sku);
        if (!ps) {
          ps = { unitsSold: 0, revenue: 0 };
          productSalesMap.set(sku, ps);
        }
        ps.unitsSold += units;
        ps.revenue += amount;
      }
    }

    // ----- Compras -----
    for (const p of purchases) {
      const items = (p as any).items as
        | {
        productSku: string;
        quantity: number;
        unitPrice: number;
        unitsPerPackage?: number;
      }[]
        | undefined;

      if (!items) continue;

      for (const it of items) {
        const sku = it.productSku;
        if (!sku) continue;

        const units =
          (Number(it.quantity) || 0) *
          (Number(it.unitsPerPackage ?? 1) || 1);
        const cost =
          (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);

        let pp = productPurchMap.get(sku);
        if (!pp) {
          pp = { unitsPurchased: 0, costPurchased: 0 };
          productPurchMap.set(sku, pp);
        }
        pp.unitsPurchased += units;
        pp.costPurchased += cost;
      }
    }

    // ----- Top productos (por unidades vendidas) -----
    this.topProducts = Array.from(productSalesMap.entries())
      .map(([sku, v]) => ({
        sku,
        name: this.productNameBySku[sku] ?? '(sin nombre)',
        totalUnits: v.unitsSold,
        totalAmount: v.revenue,
      }))
      .sort((a, b) => b.totalUnits - a.totalUnits)
      .slice(0, 5);

    // ----- Comparativo compras vs ventas por producto -----
    const allSkus = new Set<string>([
      ...Array.from(productSalesMap.keys()),
      ...Array.from(productPurchMap.keys()),
    ]);

    const comparative: typeof this.productComparative = [];
    let totalCostOfSold = 0;

    allSkus.forEach((sku) => {
      const s = productSalesMap.get(sku);
      const p = productPurchMap.get(sku);

      const unitsSold = s?.unitsSold ?? 0;
      const revenue = s?.revenue ?? 0;

      const unitsPurchased = p?.unitsPurchased ?? 0;
      const costPurchased = p?.costPurchased ?? 0;

      const avgCostPerUnit =
        unitsPurchased > 0 ? costPurchased / unitsPurchased : 0;

      const costOfSold = unitsSold * avgCostPerUnit;
      const profit = revenue - costOfSold;
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

      totalCostOfSold += costOfSold;

      comparative.push({
        sku,
        name: this.productNameBySku[sku] ?? '(sin nombre)',
        unitsPurchased,
        costPurchased,
        unitsSold,
        revenue,
        costOfSold,
        profit,
        marginPct,
      });
    });

    this.productComparative = comparative
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10); // top 10 productos por utilidad

    // Máximos para las barras
    this.maxUnitsSold = this.productComparative.reduce(
      (max, p) => Math.max(max, p.unitsSold),
      1
    );
    this.maxRevenue = this.productComparative.reduce(
      (max, p) => Math.max(max, p.revenue),
      1
    );

    this.totalCostOfSold = totalCostOfSold;
    this.estimatedProfit = this.totalSalesAmount - this.totalCostOfSold;
  }
}
