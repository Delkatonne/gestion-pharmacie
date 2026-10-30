import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, erreur } from '../core/api.service';
import { FcfaPipe } from '../core/fcfa.pipe';

@Component({
  selector: 'app-appro', standalone: true, imports: [FormsModule, FcfaPipe],
  template: `
  <div class="page-head"><h1>Approvisionnements</h1></div>
  @if (error) { <div class="alert">{{ error }}</div> }
  @if (msg) { <div class="ok">{{ msg }}</div> }
  @if (api.role !== 'vendeur') {
    <div class="card"><h3>Entrée de stock</h3>
      <div class="grid">
        <label>Médicament
          <select [(ngModel)]="f.produit_id"><option [ngValue]="null">—</option>
            @for (p of produits; track p.id) { <option [ngValue]="p.id">{{ p.nom }} (stock {{ p.quantite }})</option> }</select></label>
        <label>Fournisseur
          <select [(ngModel)]="f.fournisseur_id"><option [ngValue]="null">—</option>
            @for (x of fournisseurs; track x.id) { <option [ngValue]="x.id">{{ x.nom }}</option> }</select></label>
        <label>Quantité reçue <input type="number" min="1" [(ngModel)]="f.quantite"></label>
        <label>Prix d'achat unitaire <input type="number" min="0" [(ngModel)]="f.prix_achat"></label>
      </div>
      <button class="btn" (click)="enregistrer()">Enregistrer l'entrée</button>
    </div>
  }
  <table>
    <tr><th>Date</th><th>Médicament</th><th>Fournisseur</th><th>Quantité</th><th>Prix d'achat</th></tr>
    @for (a of liste; track a.id) {
      <tr><td>{{ a.date.replace('T', ' ').slice(0, 16) }}</td><td>{{ a.produit_nom }}</td>
        <td>{{ a.fournisseur_nom }}</td><td>{{ a.quantite }}</td><td>{{ a.prix_achat | fcfa }}</td></tr>
    }
  </table>`,
})
export class ApprovisionnementsComponent implements OnInit {
  api = inject(Api);
  produits: any[] = []; fournisseurs: any[] = []; liste: any[] = [];
  f: any = { produit_id: null, fournisseur_id: null, quantite: 1, prix_achat: 0 };
  error = ''; msg = '';

  ngOnInit() {
    this.api.get('/fournisseurs').subscribe(r => this.fournisseurs = r);
    this.charger();
  }
  charger() {
    this.api.get('/produits').subscribe(r => this.produits = r);
    this.api.get('/approvisionnements').subscribe(r => this.liste = r);
  }
  enregistrer() {
    this.error = ''; this.msg = '';
    if (!this.f.produit_id) { this.error = 'Choisissez un médicament'; return; }
    this.api.post('/approvisionnements', this.f).subscribe({
      next: () => { this.msg = 'Stock mis à jour.'; this.f = { produit_id: null, fournisseur_id: null, quantite: 1, prix_achat: 0 }; this.charger(); },
      error: e => this.error = erreur(e),
    });
  }
}
