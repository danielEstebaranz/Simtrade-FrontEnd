import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((component) => component.Login),
  },
  {
    path: 'panel',
    loadComponent: () => import('./pages/dashboard/dashboard').then((component) => component.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cartera' },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/dashboard/components/perfil-section/perfil-section').then(
            (component) => component.PerfilSection,
          ),
      },
      {
        path: 'cartera',
        loadComponent: () =>
          import('./pages/dashboard/components/cartera-section/cartera-section').then(
            (component) => component.CarteraSection,
          ),
      },
      {
        path: 'mercado',
        loadComponent: () =>
          import('./pages/dashboard/components/mercado-section/mercado-section').then(
            (component) => component.MercadoSection,
          ),
      },
      { path: 'operaciones', redirectTo: 'mercado' },
      { path: 'alertas', redirectTo: 'historial' },
      {
        path: 'historial',
        loadComponent: () =>
          import('./pages/dashboard/components/historial-section/historial-section').then(
            (component) => component.HistorialSection,
          ),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./pages/dashboard/components/estadisticas-section/estadisticas-section').then(
            (component) => component.EstadisticasSection,
          ),
      },
      { path: 'ranking', redirectTo: 'estadisticas' },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/dashboard/components/configuracion-section/configuracion-section').then(
            (component) => component.ConfiguracionSection,
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
