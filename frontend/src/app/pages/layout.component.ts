import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api } from '../core/api.service';

@Component({
  selector: 'app-layout', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="shell">
    <nav class="side">
      <div class="brand">💊 Pharmacie</div>
      <a routerLink="/dashboard" routerLinkActive="active">Tableau de bord</a>
      <a routerLink="/ventes" routerLinkActive="active">Ventes</a>
      <a routerLink="/produits" routerLinkActive="active">Médicaments</a>
      <a routerLink="/approvisionnements" routerLinkActive="active">Approvisionnements</a>
      <a routerLink="/clients" routerLinkActive="active">Clients</a>
      <a routerLink="/fournisseurs" routerLinkActive="active">Fournisseurs</a>
      @if (api.role === 'admin') { <a routerLink="/utilisateurs" routerLinkActive="active">Utilisateurs</a> }
      <div class="me">{{ api.nom }} ({{ api.role }})<br>
        <a href="#" (click)="$event.preventDefault(); api.logout()" style="padding:6px 0">Déconnexion</a></div>
    </nav>
    <main class="main"><router-outlet /></main>
  </div>`,
})
export class LayoutComponent { api = inject(Api); }
