import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from './auth';
import { MarketAsset } from './assets';

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

export interface PortfolioGains {
  costBasisSource: 'history' | 'balance_estimate' | 'none';
  dailyGain: number;
  hasCostBasis: boolean;
  investedCost: number;
  positions: Record<string, PortfolioPositionGains>;
  source: TrendSource;
  totalGain: number;
  totalValue: number;
}

export interface PortfolioPositionGains {
  costBasisSource: 'history' | 'balance_estimate' | 'none';
  dailyGain: number;
  hasCostBasis: boolean;
  investedCost: number;
  totalGain: number;
  totalValue: number;
}

export interface BuyAssetResponse {
  message: string;
  operation: {
    balance: number;
    price: number;
    quantity: number;
    ticker: string;
    total: number;
  };
  user: AuthUser;
}

export interface SellAssetResponse {
  message: string;
  operation: {
    balance: number;
    percentage: number;
    price: number;
    quantity: number;
    ticker: string;
    total: number;
  };
  user: AuthUser;
}

export interface HistoryResponse {
  items: HistoryItem[];
}

export interface HistoryItem {
  date: string | null;
  id: string;
  price: number;
  quantity: number;
  ticker: string;
  total: number;
  type: 'compra' | 'deposito' | 'reinicio' | 'retirada' | 'venta' | string;
}

export interface MarketPerformance {
  change: number;
  changePercent: number;
  lastPrice: number;
  name: string;
  ticker: string;
}

export interface MarketStatisticsRange {
  best: MarketPerformance | null;
  items: MarketPerformance[];
  worst: MarketPerformance | null;
}

export interface MarketStatisticsResponse {
  daily: MarketStatisticsRange;
  source: TrendSource;
  weekly: MarketStatisticsRange;
}

export interface MarketAssetsResponse {
  items: MarketAsset[];
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

  getPortfolioGains(token: string): Observable<PortfolioGains> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<PortfolioGains>(`${this.apiUrl}/users/me/portfolio/gains`, { headers });
  }

  buyAsset(token: string, ticker: string, amount: number): Observable<BuyAssetResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<BuyAssetResponse>(
      `${this.apiUrl}/users/me/portfolio/buy`,
      { amount, ticker },
      { headers },
    );
  }

  sellAsset(token: string, ticker: string, percentage: number): Observable<SellAssetResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<SellAssetResponse>(
      `${this.apiUrl}/users/me/portfolio/sell`,
      { percentage, ticker },
      { headers },
    );
  }

  getHistory(token: string): Observable<HistoryResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<HistoryResponse>(`${this.apiUrl}/users/me/history`, { headers });
  }

  getStatistics(): Observable<MarketStatisticsResponse> {
    return this.http.get<MarketStatisticsResponse>(`${this.apiUrl}/market/statistics`);
  }

  getAssets(): Observable<MarketAssetsResponse> {
    return this.http.get<MarketAssetsResponse>(`${this.apiUrl}/market/assets`);
  }
}
