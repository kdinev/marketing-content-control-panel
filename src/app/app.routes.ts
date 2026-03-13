import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'product/:area',
    loadComponent: () =>
      import('./components/product-area/product-area.component').then(
        (m) => m.ProductAreaComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/content-creator/content-creator.component').then(
        (m) => m.ContentCreatorComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
