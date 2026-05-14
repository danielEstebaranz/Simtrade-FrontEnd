import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from './auth';
import { AppTheme } from './theme';

export interface AccountSettings {
  theme: AppTheme;
}

export interface SettingsResponse {
  message?: string;
  settings: AccountSettings;
  user: AuthUser;
}

export interface AddFundsResponse {
  message: string;
  operation: {
    amount: number;
    balance: number;
  };
  user: AuthUser;
}

export interface DeleteAccountResponse {
  deleted_transactions: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000';

  getSettings(token: string): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.apiUrl}/users/me/settings`, this.authOptions(token));
  }

  updateSettings(token: string, theme: AppTheme): Observable<SettingsResponse> {
    return this.http.patch<SettingsResponse>(
      `${this.apiUrl}/users/me/settings`,
      { theme },
      this.authOptions(token),
    );
  }

  addFunds(token: string, amount: number): Observable<AddFundsResponse> {
    return this.http.post<AddFundsResponse>(
      `${this.apiUrl}/users/me/funds`,
      { amount },
      this.authOptions(token),
    );
  }

  deleteAccount(token: string): Observable<DeleteAccountResponse> {
    return this.http.delete<DeleteAccountResponse>(`${this.apiUrl}/users/me`, this.authOptions(token));
  }

  private authOptions(token: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }
}
