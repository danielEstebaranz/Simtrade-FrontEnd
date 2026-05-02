import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { AlertasSection } from './pages/dashboard/components/alertas-section/alertas-section';
import { CarteraSection } from './pages/dashboard/components/cartera-section/cartera-section';
import { ConfiguracionSection } from './pages/dashboard/components/configuracion-section/configuracion-section';
import { MercadoSection } from './pages/dashboard/components/mercado-section/mercado-section';
import { OperacionesSection } from './pages/dashboard/components/operaciones-section/operaciones-section';
import { RankingSection } from './pages/dashboard/components/ranking-section/ranking-section';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'panel',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cartera' },
      { path: 'cartera', component: CarteraSection },
      { path: 'mercado', component: MercadoSection },
      { path: 'operaciones', component: OperacionesSection },
      { path: 'alertas', component: AlertasSection },
      { path: 'ranking', component: RankingSection },
      { path: 'configuracion', component: ConfiguracionSection },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
