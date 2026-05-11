import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type TrendRange = '1d' | '1w' | '1y';
export type TrendSource = 'yfinance' | 'finnhub';

export interface TrendPoint {
  timestamp: number;
  price: number;
}

export interface TrendResponse {
  ticker: string;
  range: TrendRange;
  points: TrendPoint[];
  source: TrendSource;
}

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000';

  getTrend(ticker: string, range: TrendRange): Observable<TrendResponse> {
    const params = new HttpParams().set('range', range);
    const url = `${this.apiUrl}/market/${encodeURIComponent(ticker)}/trend`;

    return this.http.get<TrendResponse>(url, { params });
  }
}
