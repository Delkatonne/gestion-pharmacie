import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login.component';
import { LayoutComponent } from './pages/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { VentesComponent } from './pages/ventes.component';
import { ApprovisionnementsComponent } from './pages/approvisionnements.component';
import { CrudComponent } from './pages/crud.component';
import { PRODUITS, CLIENTS, FOURNISSEURS, UTILISATEURS } from './pages/crud.configs';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: LayoutComponent, canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ventes', component: VentesComponent },
      { path: 'approvisionnements', component: ApprovisionnementsComponent },
      { path: 'produits', component: CrudComponent, data: PRODUITS },
      { path: 'clients', component: CrudComponent, data: CLIENTS },
      { path: 'fournisseurs', component: CrudComponent, data: FOURNISSEURS },
      { path: 'utilisateurs', component: CrudComponent, data: UTILISATEURS },
    ],
  },
  { path: '**', redirectTo: '' },
];
