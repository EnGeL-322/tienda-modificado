// src/app/app-routing-module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

import { ProductList } from './features/catalogo/pages/product-list/product-list';
import { ProductForm } from './features/catalogo/pages/product-form/product-form';

import { InventoryDetail } from './features/inventario/pages/inventory-detail/inventory-detail';

import { PurchaseForm } from './features/compras/pages/purchase-form/purchase-form';
import { PurchaseDetail } from './features/compras/pages/purchase-detail/purchase-detail';

import { SaleCart } from './features/ventas/pages/sale-cart/sale-cart';
import { SaleDetail } from './features/ventas/pages/sale-detail/sale-detail';
import {PurchaseList} from './features/compras/pages/purchase-list/purchase-list';
import {SaleList} from './features/ventas/pages/sale-list/sale-list';

const routes: Routes = [
  // AUTH
  { path: 'auth/login', component: Login },

  // DASHBOARD
  { path: 'dashboard', component: Dashboard },

  // CATÁLOGO
  {
    path: 'catalogo',
    children: [
      { path: 'productos', component: ProductList },
      { path: 'productos/nuevo', component: ProductForm },
      { path: 'productos/:id', component: ProductForm }, // edición
      { path: 'productos/:id', component: ProductForm }, // 👈 edición
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
    ],
  },

  // INVENTARIO
  { path: 'inventario', component: InventoryDetail },

  // COMPRAS
  { path: 'compras', component: PurchaseList },       // 👈 LISTADO
  { path: 'compras/nueva', component: PurchaseForm },
  { path: 'compras/:id', component: PurchaseDetail },

  // VENTAS
  { path: 'ventas', component: SaleList },           // 👈 listado
  { path: 'ventas/nueva', component: SaleCart },
  { path: 'ventas/:id', component: SaleDetail },
  { path: 'ventas/nueva', component: SaleCart },
  { path: 'ventas/:id', component: SaleDetail },


  // REDIRECCIONES
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
