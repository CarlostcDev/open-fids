import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'data-sources',
    loadComponent: () => import('./components/data-sources/data-sources').then(m => m.DataSources)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./components/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
