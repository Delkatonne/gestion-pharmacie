import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, erreur } from '../core/api.service';
import { FcfaPipe } from '../core/fcfa.pipe';

@Component({
  selector: 'app-ventes', standalone: true, imports: [FormsModule, FcfaPipe],
  template: `
  <div class="page-head"><h1>Ventes</h1></div>
  @if (error) { <div class="alert">{{ error }}</div> }
  @if (msg) { <div class="ok">{{ msg }}</div> }
  <div class="two">
    <div class="card"><h3>Rechercher un médicament</h3>
      <input style="width:100%" placeholder="Nom ou code…" [(ngModel)]="q">
      <table>
        @for (p of resultats; track p.id) {
          <tr><td>{{ p.nom }} @if (p.ordonnance_requise) { <span title="Ordonnance">📋</span> }</td>
            <td>{{ p.prix_vente | fcfa }}</td><td>Stock : {{ p.quantite }}</td>
            <td><button class="btn sm" (click)="ajouter(p)">Ajouter</button></td></tr>
        }
      </table>
    </div>
    <div class="card"><h3>Panier</h3>
      <table>
        @for (l of panier; track l.produit.id) {
          <tr><td>{{ l.produit.nom }}</td>
            <td><input type="number" min="1" [max]="l.produit.quantite" style="width:70px" [(ngModel)]="l.quantite"></td>
            <td>{{ l.produit.prix_vente * l.quantite | fcfa }}</td>
            <td><button class="btn sm danger" (click)="retirer(l)">✕</button></td></tr>
        }
      </table>
      <h2>Total : {{ total | fcfa }}</h2>
      <div class="grid">
        <label>Client
          <select [(ngModel)]="clientId"><option [ngValue]="null">Client comptoir</option>
            @for (c of clients; track c.id) { <option [ngValue]="c.id">{{ c.nom }}</option> }</select></label>
        <label>Paiement
          <select [(ngModel)]="paiement"><option value="especes">Espèces</option>
            <option value="mobile_money">Mobile Money</option><option value="carte">Carte</option></select></label>
      </div>
      <button class="btn" [disabled]="!panier.length" (click)="valider()">Valider la vente</button>
    </div>
  </div>
  <h3>Dernières ventes</h3>
  <table>
    <tr><th>N°</th><th>Date</th><th>Client</th><th>Vendeur</th><th>Articles</th><th>Total</th><th></th></tr>
    @for (v of ventes; track v.id) {
      <tr><td>{{ v.id }}</td><td>{{ v.date.replace('T', ' ').slice(0, 16) }}</td>
        <td>{{ v.client_nom }}</td><td>{{ v.vendeur }}</td>
        <td>@for (l of v.lignes; track $index) { {{ l.quantite }}× {{ l.produit_nom }}; }</td>
        <td>{{ v.total | fcfa }}</td>
        <td>@if (api.role !== 'vendeur') { <button class="btn sm danger" (click)="annuler(v)">Annuler</button> }</td></tr>
    }
  </table>`,
})
export class VentesComponent implements OnInit {
  api = inject(Api);
  produits: any[] = []; clients: any[] = []; ventes: any[] = [];
  panier: { produit: any; quantite: number }[] = [];
  q = ''; clientId: number | null = null; paiement = 'especes'; error = ''; msg = '';

  ngOnInit() { this.charger(); this.api.get('/clients').subscribe(r => this.clients = r); }
  charger() {
    this.api.get('/produits').subscribe(r => this.produits = r);
    this.api.get('/ventes').subscribe(r => this.ventes = r);
  }
  get resultats() {
    const s = this.q.toLowerCase();
    return this.produits.filter(p => p.quantite > 0 &&
      (!s || p.nom.toLowerCase().includes(s) || (p.code || '').toLowerCase().includes(s))).slice(0, 8);
  }
  get total() { return this.panier.reduce((t, l) => t + l.produit.prix_vente * l.quantite, 0); }
  ajouter(p: any) {
    const l = this.panier.find(x => x.produit.id === p.id);
    if (l) l.quantite = Math.min(l.quantite + 1, p.quantite); else this.panier.push({ produit: p, quantite: 1 });
  }
  retirer(l: any) { this.panier = this.panier.filter(x => x !== l); }
  valider() {
    this.error = ''; this.msg = '';
    const body = {
      client_id: this.clientId, mode_paiement: this.paiement,
      lignes: this.panier.map(l => ({ produit_id: l.produit.id, quantite: l.quantite })),
    };
    this.api.post('/ventes', body).subscribe({
      next: (v: any) => { this.msg = `Vente n°${v.id} enregistrée.`; this.panier = []; this.charger(); },
      error: e => this.error = erreur(e),
    });
  }
  annuler(v: any) {
    if (!confirm(`Annuler la vente n°${v.id} ? Le stock sera remis.`)) return;
    this.api.delete('/ventes/' + v.id).subscribe({ next: () => this.charger(), error: e => this.error = erreur(e) });
  }
}
