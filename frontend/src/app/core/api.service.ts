import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private router = inject(Router);

  get token() { return localStorage.getItem('token'); }
  get role() { return localStorage.getItem('role') || ''; }
  get nom() { return localStorage.getItem('nom') || ''; }
  get connecte() { return !!this.token; }
  peutEcrire(roles: string[]) { return roles.includes(this.role); }

  login(username: string, password: string) {
    const body = new URLSearchParams({ username, password });
    return this.http.post<any>('/api/auth/login', body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .pipe(tap(r => {
        localStorage.setItem('token', r.access_token);
        localStorage.setItem('role', r.role);
        localStorage.setItem('nom', r.nom);
      }));
  }
  logout() { localStorage.clear(); this.router.navigate(['/login']); }

  get<T = any>(p: string) { return this.http.get<T>('/api' + p); }
  post<T = any>(p: string, b: any) { return this.http.post<T>('/api' + p, b); }
  put<T = any>(p: string, b: any) { return this.http.put<T>('/api' + p, b); }
  delete(p: string) { return this.http.delete('/api' + p); }
}

export function erreur(e: any): string {
  const d = e?.error?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x: any) => x.msg).join(' ; ');
  return 'Une erreur est survenue';
}
