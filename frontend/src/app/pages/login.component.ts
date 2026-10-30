import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api, erreur } from '../core/api.service';

@Component({
  selector: 'app-login', standalone: true, imports: [FormsModule],
  template: `
  <div class="card login">
    <h1>💊 Pharmacie</h1><p class="muted">Connexion</p>
    @if (err) { <div class="alert">{{ err }}</div> }
    <label>Identifiant <input [(ngModel)]="username" (keyup.enter)="go()"></label>
    <label>Mot de passe <input type="password" [(ngModel)]="password" (keyup.enter)="go()"></label>
    <button class="btn" (click)="go()">Se connecter</button>
  </div>`,
})
export class LoginComponent {
  private api = inject(Api); private router = inject(Router);
  username = ''; password = ''; err = '';
  go() {
    this.api.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: e => this.err = erreur(e),
    });
  }
}
