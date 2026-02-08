import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'edict_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private tokenSignal = signal<string | null>(this.getStoredToken());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  getToken(): string | null {
    return this.tokenSignal();
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  loginWithGoogle(): void {
    const apiUrl = environment.apiUrl;
    // Redirect to backend auth; cannot assert in unit test without reload
    /* istanbul ignore next */
    window.location.href = `${apiUrl}/auth/google`;
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    }
    this.clearToken();
    this.router.navigate(['/']);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
