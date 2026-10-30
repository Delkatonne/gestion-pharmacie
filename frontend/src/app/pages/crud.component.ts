import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api, erreur } from '../core/api.service';
import { CrudConfig, Field } from './crud.configs';

@Component({
  selector: 'app-crud', standalone: true, imports: [FormsModule],
  template: `
  <div class="page-head"><h1>{{ cfg.title }}</h1>
    <div>
      <input placeholder="Rechercher…" [(ngModel)]="search">
      @if (canWrite) { <button class="btn" (click)="nouveau()">+ Ajouter</button> }
    </div>
  </div>
  @if (error) { <div class="alert">{{ error }}</div> }
  @if (show) {
    <div class="card"><h3>{{ editId ? 'Modifier' : 'Nouveau' }}</h3>
      <div class="grid">
        @for (f of cfg.fields; track f.key) {
          <label>{{ f.label }}
            @switch (f.type) {
              @case ('number') { <input type="number" [(ngModel)]="form[f.key]"> }
              @case ('date') { <input type="date" [(ngModel)]="form[f.key]"> }
              @case ('password') { <input type="password" [(ngModel)]="form[f.key]" autocomplete="new-password"> }
              @case ('checkbox') { <input type="checkbox" [(ngModel)]="form[f.key]"> }
              @case ('select') {
                <select [(ngModel)]="form[f.key]">
                  <option [ngValue]="null">—</option>
                  @for (o of opts(f); track o.value) { <option [ngValue]="o.value">{{ o.label }}</option> }
                </select>
              }
              @default { <input [(ngModel)]="form[f.key]"> }
            }
          </label>
        }
      </div>
      <button class="btn" (click)="save()">Enregistrer</button>
      <button class="btn ghost" (click)="show = false">Annuler</button>
    </div>
  }
  <table>
    <tr>
      @for (f of colonnes; track f.key) { <th>{{ f.label }}</th> }
      @if (canWrite) { <th></th> }
    </tr>
    @for (it of filtres; track it.id) {
      <tr [class.warn]="cfg.warn && cfg.warn(it)">
        @for (f of colonnes; track f.key) { <td>{{ afficher(it, f) }}</td> }
        @if (canWrite) {
          <td>
            <button class="btn sm ghost" (click)="modifier(it)">Modifier</button>
            <button class="btn sm danger" (click)="supprimer(it)">Supprimer</button>
          </td>
        }
      </tr>
    }
  </table>`,
})
export class CrudComponent implements OnInit {
  private api = inject(Api);
  cfg = inject(ActivatedRoute).snapshot.data as CrudConfig;
  items: any[] = []; form: any = {}; editId: number | null = null;
  show = false; search = ''; error = ''; lookups: Record<string, any[]> = {};

  get canWrite() { return this.api.peutEcrire(this.cfg.writeRoles); }
  get colonnes() { return this.cfg.fields.filter(f => f.list !== false); }
  get filtres() {
    const s = this.search.toLowerCase();
    return this.items.filter(i => !s || JSON.stringify(Object.values(i)).toLowerCase().includes(s));
  }

  ngOnInit() {
    this.charger();
    for (const f of this.cfg.fields) {
      if (f.source) this.api.get(f.source).subscribe(r => this.lookups[f.key] = r);
    }
  }
  charger() { this.api.get(this.cfg.endpoint).subscribe({ next: r => this.items = r, error: e => this.error = erreur(e) }); }

  opts(f: Field) {
    if (f.options) return f.options;
    return (this.lookups[f.key] || []).map(o => ({ value: o.id, label: o[f.optionLabel || 'nom'] }));
  }
  afficher(it: any, f: Field) {
    const v = it[f.key];
    if (v === null || v === undefined || v === '') return '';
    if (f.type === 'checkbox') return v ? 'Oui' : 'Non';
    if (f.type === 'select') return this.opts(f).find(o => o.value === v)?.label ?? v;
    if (f.money) return new Intl.NumberFormat('fr-FR').format(v) + ' FCFA';
    return v;
  }

  nouveau() {
    this.editId = null; this.error = '';
    this.form = {};
    for (const f of this.cfg.fields) this.form[f.key] = f.type === 'checkbox' ? false : (f.type === 'number' ? 0 : null);
    this.show = true;
  }
  modifier(it: any) {
    this.editId = it.id; this.error = '';
    this.form = { ...it, password: null };
    this.show = true;
  }
  save() {
    const body: any = {};
    for (const f of this.cfg.fields) {
      let v = this.form[f.key];
      if (v === '') v = null;
      body[f.key] = v;
    }
    const req = this.editId
      ? this.api.put(`${this.cfg.endpoint}/${this.editId}`, body)
      : this.api.post(this.cfg.endpoint, body);
    req.subscribe({
      next: () => { this.show = false; this.error = ''; this.charger(); },
      error: e => this.error = erreur(e),
    });
  }
  supprimer(it: any) {
    if (!confirm('Supprimer cet élément ?')) return;
    this.api.delete(`${this.cfg.endpoint}/${it.id}`).subscribe({
      next: () => this.charger(), error: e => this.error = erreur(e),
    });
  }
}
