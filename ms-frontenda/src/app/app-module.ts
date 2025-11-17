// src/app/app-module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// AUTH
import { Login } from './auth/login/login';
import { authInterceptor } from './core/auth-interceptor';

// PAGES
import { Dashboard } from './pages/dashboard/dashboard';

// CATÁLOGO
import { ProductForm } from './features/catalogo/pages/product-form/product-form';
import { ProductList } from './features/catalogo/pages/product-list/product-list';

// INVENTARIO
import { InventoryDetail } from './features/inventario/pages/inventory-detail/inventory-detail';

// COMPRAS
import { PurchaseForm } from './features/compras/pages/purchase-form/purchase-form';
import { PurchaseDetail } from './features/compras/pages/purchase-detail/purchase-detail';

// VENTAS
import { SaleCart } from './features/ventas/pages/sale-cart/sale-cart';
import { SaleDetail } from './features/ventas/pages/sale-detail/sale-detail';
import {PurchaseList} from './features/compras/pages/purchase-list/purchase-list';
import {SaleList} from './features/ventas/pages/sale-list/sale-list';

@NgModule({
  declarations: [
    App,            // 👈 correcto: componente raíz
    Login,
    Dashboard,
    ProductForm,
    ProductList,
    InventoryDetail,
    PurchaseForm,
    PurchaseDetail,
    PurchaseList, // 👈 AGREGA ESTO
    SaleList, // 👈 AGREGA AQUÍ
    SaleCart,
    SaleDetail,
  ],
  imports: [
    BrowserModule,      // ngIf, ngFor, pipes, etc.
    FormsModule,        // [(ngModel)]
    AppRoutingModule,   // router-outlet + rutas
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
