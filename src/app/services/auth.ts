import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { catchError, map, Observable, throwError, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  saldo: number;
  cartera: Record<string, number>;
}

interface AuthResponse {
  message: string;
  user: AuthUser;
  idToken?: string;
  refreshToken?: string;
}

interface AuthPayload {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://127.0.0.1:8000';
  private readonly userState = signal<AuthUser | null>(this.readStoredUser());
  private readonly tokenState = signal<string | null>(this.readStoredToken());

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly idToken = this.tokenState.asReadonly();

  login(payload: AuthPayload): Observable<AuthUser> {
    return this.sendAuthRequest('/auth/login', payload);
  }

  register(payload: AuthPayload): Observable<AuthUser> {
    return this.sendAuthRequest('/auth/register', payload);
  }

  logout(): void {
    this.userState.set(null);
    this.tokenState.set(null);

    if (this.isBrowser()) {
      localStorage.removeItem('simtrade_user');
      localStorage.removeItem('simtrade_token');
    }
  }

  private sendAuthRequest(path: string, payload: AuthPayload): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.apiUrl}${path}`, payload).pipe(
      tap((response) => this.storeSession(response.user, response.idToken)),
      map((response) => response.user),
      catchError((error: HttpErrorResponse) => throwError(() => this.getErrorMessage(error))),
    );
  }

  private storeSession(user: AuthUser, token?: string): void {
    this.userState.set(user);
    this.tokenState.set(token ?? null);

    if (this.isBrowser()) {
      localStorage.setItem('simtrade_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('simtrade_token', token);
      } else {
        localStorage.removeItem('simtrade_token');
      }
    }
  }

  private readStoredUser(): AuthUser | null {
    if (!this.isBrowser()) {
      return null;
    }

    const storedUser = localStorage.getItem('simtrade_user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem('simtrade_user');
      return null;
    }
  }

  private readStoredToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('simtrade_token');
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }

    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    if (error.status === 0) {
      return 'No se puede conectar con el backend. Arranca la API en el puerto 8000.';
    }

    return 'No se pudo completar la operacion.';
  }
}
