import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../services/purchase';
import {
  CreatePurchase,
  CreatePurchaseItem,
} from '../../models/create-purchase.model';
import { PurchaseOrder } from '../../models/purchase-order.model';

// Proveedor
import { SupplierService } from '../../../../services/supplier.service';
import { Supplier, CreateSupplier } from '../../../../models/supplier.model';

// Productos (del catálogo)
import { Product } from '../../../catalogo/models/product.model';
import { ProductService } from '../../../catalogo/services/product';
import {AccountingService} from '../../../../services/accounting';
import {PurchaseEntryRequest} from '../../../../models/accounting.model';

@Component({
  selector: 'app-purchase-form',
  standalone: false,
  templateUrl: './purchase-form.html',
  styleUrls: ['./purchase-form.scss'],
})
export class PurchaseForm implements OnInit {
  // ----- PROVEEDOR -----
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  supplierSearch = '';
  selectedSupplier: Supplier | null = null;

  supplierSearchTouched = false;
  loadingSuppliers = false;

  // Alta rápida de proveedor
  showNewSupplierForm = false;
  creatingSupplier = false;
  newSupplierName = '';
  newSupplierRuc = '';
  newSupplierPhone = '';
  newSupplierAddress = '';
  newSupplierEmail = '';

  // ----- PRODUCTOS -----
  products: Product[] = [];
  loadingProducts = false;

  // ----- ÍTEMS DE LA ORDEN -----
  items: CreatePurchaseItem[] = [
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

  lastOrder: PurchaseOrder | null = null;

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private accountingService: AccountingService,   // 👈 NUEVO
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
  }

  // Cargar lista de proveedores
  loadSuppliers(): void {
    this.loadingSuppliers = true;
    this.supplierService.getAll().subscribe({
      next: (suppliers) => {
        this.loadingSuppliers = false;
        this.suppliers = suppliers;
        this.filteredSuppliers = suppliers;
      },
      error: () => {
        this.loadingSuppliers = false;
        this.error = 'No se pudieron cargar los proveedores';
      },
    });
  }

  // Cargar lista de productos
  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.loadingProducts = false;
        this.products = products;
      },
      error: () => {
        this.loadingProducts = false;
        // no pisamos un error anterior si ya había
        if (!this.error) {
          this.error = 'No se pudieron cargar los productos';
        }
      },
    });
  }

  // Filtrar mientras escribe proveedor
  onSupplierSearchChange(term: string): void {
    this.supplierSearch = term;
    this.supplierSearchTouched = true;
    this.selectedSupplier = null; // si cambia texto, se des-selecciona

    const t = term.trim().toLowerCase();
    if (!t) {
      this.filteredSuppliers = this.suppliers;
      return;
    }

    this.filteredSuppliers = this.suppliers.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(t)) ||
        (s.ruc && s.ruc.toLowerCase().includes(t))
    );
  }

  // Elegir proveedor de la lista de sugerencias
  selectSupplier(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.supplierSearch = supplier.name;
    this.supplierSearchTouched = true;
    this.showNewSupplierForm = false;
  }

  // Elegir proveedor desde el <select>
  onSupplierSelectChange(idStr: string): void {
    const id = Number(idStr);
    if (!id) {
      this.selectedSupplier = null;
      return;
    }
    const supplier = this.suppliers.find((s) => s.id === id) || null;
    this.selectedSupplier = supplier;
    if (supplier) {
      this.supplierSearch = supplier.name;
      this.supplierSearchTouched = true;
      this.showNewSupplierForm = false;
    }
  }

  // Limpiar proveedor seleccionado
  clearSupplier(): void {
    this.selectedSupplier = null;
    this.supplierSearch = '';
    this.supplierSearchTouched = false;
    this.showNewSupplierForm = false;
  }

  // Crear proveedor nuevo
  createSupplier(): void {
    if (!this.newSupplierName.trim()) {
      this.error = 'Ingrese el nombre del proveedor';
      this.success = null;
      return;
    }

    const dto: CreateSupplier = {
      name: this.newSupplierName.trim(),
      ruc: this.newSupplierRuc.trim() || undefined,
      phone: this.newSupplierPhone.trim() || undefined,
      address: this.newSupplierAddress.trim() || undefined,
      email: this.newSupplierEmail.trim() || undefined,
    };

    this.creatingSupplier = true;
    this.error = null;

    this.supplierService.create(dto).subscribe({
      next: (supplier) => {
        this.creatingSupplier = false;

        // agregar a la lista y seleccionar
        this.suppliers.push(supplier);
        this.selectedSupplier = supplier;
        this.supplierSearch = supplier.name;
        this.showNewSupplierForm = false;

        // limpiar campos del mini-form
        this.newSupplierName = '';
        this.newSupplierRuc = '';
        this.newSupplierPhone = '';
        this.newSupplierAddress = '';
        this.newSupplierEmail = '';
      },
      error: (err) => {
        this.creatingSupplier = false;
        console.error('Error creando proveedor', err);

        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 0) {
          this.error = 'No se pudo conectar con el servidor de compras';
        } else {
          this.error = 'No se pudo crear el proveedor';
        }
      },
    });
  }

  // ----- ÍTEMS -----
  addItem(): void {
    this.items.push({
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      unitType: 'UNIDAD',
      unitsPerPackage: 1,
    });
  }

  removeItem(index: number): void {
    if (this.items.length === 1) return;
    this.items.splice(index, 1);
  }

  // Cuando selecciona un producto desde el select
  onProductSelectChange(rowIndex: number, sku: string): void {
    const item = this.items[rowIndex];
    if (!item) return;

    const trimmed = (sku || '').trim();
    if (!trimmed) return;

    item.productSku = trimmed;
  }

  itemSubtotal(item: CreatePurchaseItem): number {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    return q * p;
  }

  itemSubtotalA(item: CreatePurchaseItem): number {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    const a = q * p;
    const b = a * 0.18;
    return a + b;
  }

  get total(): number {
    return this.items.reduce(
      (acc, item) => acc + this.itemSubtotalA(item),
      0
    );
  }

  // ----- ENVIAR ORDEN -----
  submit(): void {
    if (!this.selectedSupplier) {
      this.error =
        'Seleccione un proveedor o créelo antes de registrar la orden';
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
      this.error = 'Agregue al menos un producto válido a la orden';
      this.success = null;
      return;
    }

    const dto: CreatePurchase = {
      supplierId: this.selectedSupplier.id,
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

    this.purchaseService.create(dto).subscribe({
      next: (order) => {
        this.loading = false;
        this.lastOrder = order;
        this.success = `Orden #${order.id} registrada para ${order.supplierName} (estado: ${order.status})`;

        // 👉 CREAR ASIENTO CONTABLE DE LA COMPRA
        const asientoDto: PurchaseEntryRequest = {
          purchaseId: order.id,
          amount: this.total,   // igual, puedes decidir si usar total sin IGV
        };

        this.accountingService.createFromPurchase(asientoDto).subscribe({
          next: () => console.log('Asiento de compra creado ok'),
          error: (err) => console.error('No se pudo crear el asiento de compra', err),
        });

        // reset items y proveedor como ya tenías
        // reset
        this.items = [
          {
            productSku: '',
            quantity: 1,
            unitPrice: 0,
            unitType: 'UNIDAD',
            unitsPerPackage: 1,
          },
        ];
        this.clearSupplier();
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
