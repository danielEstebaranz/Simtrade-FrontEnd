import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { CarteraSection } from './pages/dashboard/components/cartera-section/cartera-section';
import { ConfiguracionSection } from './pages/dashboard/components/configuracion-section/configuracion-section';
import { HistorialSection } from './pages/dashboard/components/historial-section/historial-section';
import { MercadoSection } from './pages/dashboard/components/mercado-section/mercado-section';
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
      { path: 'operaciones', redirectTo: 'mercado' },
      { path: 'alertas', redirectTo: 'historial' },
      { path: 'historial', component: HistorialSection },
      { path: 'ranking', component: RankingSection },
      { path: 'configuracion', component: ConfiguracionSection },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
