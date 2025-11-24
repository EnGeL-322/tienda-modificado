import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleService } from '../../services/sale';
import { CreateSale, CreateSaleItem } from '../../models/create-sale.model';
import { Sale } from '../../models/sale.model';
import { CreateCustomer, Customer } from '../../../../models/customer.model';
import { CustomerService } from '../../services/customer';

// 👇 IMPORTAR PRODUCTOS DEL CATÁLOGO (igual que en compras)
import { Product } from '../../../catalogo/models/product.model';
import { ProductService } from '../../../catalogo/services/product';
import {AccountingService} from '../../../../services/accounting';
import {SaleEntryRequest} from '../../../../models/accounting.model';
import { PurchaseService } from '../../../compras/services/purchase';
import { PurchaseOrder } from '../../../compras/models/purchase-order.model';

@Component({
  selector: 'app-sale-cart',
  standalone: false,
  templateUrl: './sale-cart.html',
  styleUrls: ['./sale-cart.scss'],
})
export class SaleCart implements OnInit {
  // Datos del cliente
  customerDni = '';
  selectedCustomer: Customer | null = null;
  customerDniSearched = false;
  searchingCustomer = false;
  creatingCustomer = false;
  newCustomerName = '';
  newCustomerPhone = '';
  // costo promedio por SKU
  private avgCostBySku: Record<string, number> = {};

  // margen por defecto (30% de ganancia)
  readonly defaultMargin = 0.30;
  // Lista completa de clientes
  customers: Customer[] = [];
  loadingCustomers = false;

  // ----- PRODUCTOS -----
  products: Product[] = [];
  loadingProducts = false;

  // Items
  items: CreateSaleItem[] = [
    {
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      unitType: 'UNIDAD',
      unitsPerPackage: 1,
    },
  ];

  loading = false;
  error: string | null = null;
  success: string | null = null;

  lastSale: Sale | null = null;

  constructor(
    private saleService: SaleService,
    private customerService: CustomerService,
    private productService: ProductService,
    private accountingService: AccountingService,   // 👈 NUEVO
    private router: Router,
    private purchaseService: PurchaseService,     // 👈 nuevo
  ) {}

  // Cargar clientes y productos al entrar
  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    this.loadAverageCostsFromPurchases();  // 👈 nuevo
  }
  private loadAverageCostsFromPurchases(): void {
    this.purchaseService.getAll().subscribe({
      next: (purchases: PurchaseOrder[]) => {
        const temp: Record<string, { units: number; cost: number }> = {};

        (purchases || []).forEach((p) => {
          const items = (p as any).items || [];
          items.forEach((it: any) => {
            const sku = it.productSku;
            if (!sku) return;

            const qty = Number(it.quantity) || 0;
            const unitsPerPackage = Number(it.unitsPerPackage ?? 1) || 1;
            const units = qty * unitsPerPackage;
            const lineCost = qty * (Number(it.unitPrice) || 0); // precio base sin IGV

            if (!temp[sku]) {
              temp[sku] = { units: 0, cost: 0 };
            }
            temp[sku].units += units;
            temp[sku].cost += lineCost;
          });
        });

        this.avgCostBySku = {};
        Object.keys(temp).forEach((sku) => {
          const { units, cost } = temp[sku];
          this.avgCostBySku[sku] = units > 0 ? cost / units : 0;
        });
      },
      error: () => {
        this.avgCostBySku = {};
      }
    });
  }

  // Cargar lista de clientes
  loadCustomers(): void {
    this.loadingCustomers = true;
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.loadingCustomers = false;
        this.customers = customers;
      },
      error: (err) => {
        this.loadingCustomers = false;
        console.error('No se pudieron cargar los clientes', err);
      },
    });
  }
  getSuggestedPrice(sku?: string | null): number | null {
    if (!sku) return null;
    const baseCost = this.avgCostBySku[sku];
    if (!baseCost || baseCost <= 0) return null;

    const suggested = baseCost * (1 + this.defaultMargin); // sin IGV
    // redondeamos a 2 decimales
    return Math.round(suggested * 100) / 100;
  }

  applySuggestedPrice(index: number): void {
    const item = this.items[index];
    if (!item) return;

    const suggested = this.getSuggestedPrice(item.productSku);
    if (suggested != null) {
      item.unitPrice = suggested;
    }
  }

  // Cargar lista de productos (para el combo)
  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.loadingProducts = false;
        this.products = products;
      },
      error: (err) => {
        this.loadingProducts = false;
        console.error('No se pudieron cargar los productos', err);
      },
    });
  }

  // ➕ Agregar producto al carrito
  addItem(): void {
    this.items.push({
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      unitType: 'UNIDAD',
      unitsPerPackage: 1,
    });
  }

  // 🔎 Buscar cliente por DNI
  searchCustomer(): void {
    const dni = this.customerDni.trim();
    if (!dni) {
      this.error = 'Ingrese el DNI del cliente';
      this.success = null;
      return;
    }

    this.searchingCustomer = true;
    this.customerDniSearched = true;
    this.selectedCustomer = null;
    this.error = null;

    this.customerService.searchByDni(dni).subscribe({
      next: (customer) => {
        this.searchingCustomer = false;
        this.selectedCustomer = customer;
        this.newCustomerName = '';
        this.newCustomerPhone = '';
      },
      error: (err) => {
        this.searchingCustomer = false;
        if (err.status === 404) {
          this.selectedCustomer = null;
        } else {
          this.error = 'No se pudo buscar el cliente';
        }
      },
    });
  }

  // Seleccionar cliente desde el combo
  onCustomerSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) {
      this.selectedCustomer = null;
      this.customerDni = '';
      this.customerDniSearched = false;
      this.newCustomerName = '';
      this.newCustomerPhone = '';
      return;
    }

    const id = Number(value);
    const customer = this.customers.find((c) => c.id === id) || null;

    this.selectedCustomer = customer;
    this.customerDni = customer ? customer.dni : '';
    this.customerDniSearched = true;
    this.newCustomerName = '';
    this.newCustomerPhone = '';
  }

  // Crear cliente nuevo
  createCustomer(): void {
    const dni = this.customerDni.trim();
    if (!dni) {
      this.error = 'Ingrese el DNI del cliente';
      this.success = null;
      return;
    }
    if (!this.newCustomerName.trim()) {
      this.error = 'Ingrese el nombre del nuevo cliente';
      this.success = null;
      return;
    }

    const dto: CreateCustomer = {
      dni,
      name: this.newCustomerName.trim(),
      phone: this.newCustomerPhone.trim() || undefined,
    };

    this.creatingCustomer = true;
    this.customerService.create(dto).subscribe({
      next: (customer) => {
        this.creatingCustomer = false;
        this.selectedCustomer = customer;
        this.newCustomerName = '';
        this.newCustomerPhone = '';
      },
      error: (err) => {
        this.creatingCustomer = false;
        console.error('Error creando cliente', err);

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 0) {
          this.error = 'No se pudo conectar con el servidor de ventas';
        } else {
          this.error = 'No se pudo crear el cliente';
        }
      },
    });
  }

  // 🔄 Cuando selecciona un producto desde el select
  onProductSelectChange(rowIndex: number, sku: string): void {
    const item = this.items[rowIndex];
    if (!item) return;

    const trimmed = (sku || '').trim();
    if (!trimmed) return;

    item.productSku = trimmed;
  }

  // 🗑️ Quitar item
  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.splice(index, 1);
  }

  // Subtotal sin IGV
  itemSubtotal(item: CreateSaleItem): number {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return q * p;
  }

  // Subtotal con IGV (18%)
  itemSubtotalA(item: CreateSaleItem): number {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    const a = q * p;
    const b = a * 0.18;
    return a + b;
  }

  // Total general
  get total(): number {
    return this.items.reduce(
      (acc, item) => acc + this.itemSubtotalA(item),
      0
    );
  }

  // Enviar venta al backend
  submit(): void {
    if (!this.selectedCustomer) {
      this.error =
        'Busque el cliente por DNI o créelo antes de registrar la venta';
      this.success = null;
      return;
    }

    const validItems = this.items.filter(
      (i) =>
        i.productSku.trim() !== '' &&
        Number(i.quantity) > 0 &&
        Number(i.unitPrice) >= 0 &&
        i.unitType &&
        Number(i.unitsPerPackage) > 0
    );

    if (validItems.length === 0) {
      this.error = 'Agregue al menos un producto válido al carrito';
      this.success = null;
      return;
    }

    const dto: CreateSale = {
      customerId: this.selectedCustomer.id,
      items: validItems.map((i) => ({
        productSku: i.productSku.trim(),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        unitType: i.unitType,
        unitsPerPackage: Number(i.unitsPerPackage) || 1,
      })),
    };

    this.loading = true;
    this.error = null;
    this.success = null;

    this.saleService.create(dto).subscribe({
      next: (sale) => {
        this.loading = false;
        this.lastSale = sale;
        this.success = `Venta #${sale.id} registrada para ${sale.customerName} (estado: ${sale.status})`;

        // 👉 CREAR ASIENTO CONTABLE DE LA VENTA
        const asientoDto: SaleEntryRequest = {
          saleId: sale.id,
          amount: this.total,   // aquí usas el total con IGV; si quieres solo base, ajustas
        };
        this.accountingService.createFromSale(asientoDto).subscribe({
          next: () => {
            console.log('Asiento de venta creado ok');
          },
          error: (err) => {
            console.error('No se pudo crear el asiento de venta', err);
            // no rompas la UX, solo loguea o si quieres pon un pequeño aviso
          },
        });


        // reset // limpiar form
        this.items = [
          {
            productSku: '',
            quantity: 1,
            unitPrice: 0,
            unitType: 'UNIDAD',
            unitsPerPackage: 1,
          },
        ];
        this.customerDni = '';
        this.selectedCustomer = null;
        this.customerDniSearched = false;
        this.newCustomerName = '';
        this.newCustomerPhone = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo registrar la venta';
      },
    });
  }
  // 🧹 Limpiar cliente seleccionado para poder buscar otro
  clearCustomer(): void {
    this.selectedCustomer = null;      // 1. Quita el objeto cliente
    this.customerDni = '';             // 2. Limpia la caja de texto del DNI
    this.customerDniSearched = false;  // 3. Resetea el estado de búsqueda
    this.newCustomerName = '';         // 4. Limpia campos de creación (si había)
    this.newCustomerPhone = '';
    this.error = null;                 // 5. Quita mensajes de error viejos
  }

  // Ir al detalle de la última venta
  goToDetail(): void {
    if (this.lastSale) {
      this.router.navigate(['/ventas', this.lastSale.id]);
    }
  }
}
