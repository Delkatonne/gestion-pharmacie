import { Component, OnInit, inject } from '@angular/core';
import { Api } from '../core/api.service';
import { FcfaPipe } from '../core/fcfa.pipe';

@Component({
  selector: 'app-dashboard', standalone: true, imports: [FcfaPipe],
  template: `
  <div class="page-head"><h1>Tableau de bord</h1></div>
  @if (d) {
    <div class="grid">
      <div class="card stat"><b>{{ d.ca_jour | fcfa }}</b>Chiffre d'affaires du jour</div>
      <div class="card stat"><b>{{ d.nb_ventes_jour }}</b>Ventes aujourd'hui</div>
      <div class="card stat"><b>{{ d.nb_produits }}</b>Médicaments référencés</div>
      <div class="card stat"><b>{{ d.valeur_stock | fcfa }}</b>Valeur du stock (achat)</div>
    </div>
    <div class="card"><h3>Ventes des 7 derniers jours</h3>
      <div class="bars">
        @for (j of d.sept_jours; track j.jour) {
          <div><span [style.height.px]="hauteur(j.ca)"></span>{{ j.jour }}<br>{{ j.ca | fcfa }}</div>
        }
      </div>
    </div>
    <div class="two">
      <div class="card"><h3>⚠️ Stock bas</h3>
        @for (p of d.stock_bas; track p.nom) { <div>{{ p.nom }} — <b style="color:#c0392b">{{ p.quantite }}</b> (seuil {{ p.seuil }})</div> }
        @empty { <span class="muted">Aucune alerte</span> }
      </div>
      <div class="card"><h3>⏳ Péremptions (60 jours)</h3>
        @for (p of d.peremption; track p.nom) { <div>{{ p.nom }} — {{ p.date }} @if (p.perime) { <b style="color:#c0392b">PÉRIMÉ</b> }</div> }
        @empty { <span class="muted">Aucune alerte</span> }
      </div>
    </div>
  }`,
})
export class DashboardComponent implements OnInit {
  private api = inject(Api);
  d: any;
  ngOnInit() { this.api.get('/dashboard').subscribe(r => this.d = r); }
  hauteur(v: number) {
    const max = Math.max(...this.d.sept_jours.map((x: any) => x.ca), 1);
    return Math.max(2, (v / max) * 90);
  }
}
