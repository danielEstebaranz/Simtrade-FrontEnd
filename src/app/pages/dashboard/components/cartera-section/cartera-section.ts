import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { AuthService } from '../../../../services/auth';
import {
  MarketService,
  PortfolioGains,
  TrendPoint,
  TrendRange,
  TrendSource,
} from '../../../../services/market';

interface PortfolioPosition {
  ticker: string;
  quantity: number;
}

interface TrendState {
  errorMessage: string;
  points: TrendPoint[];
  source: TrendSource | null;
  status: 'idle' | 'loading' | 'loaded' | 'error';
}

interface TrendSummary {
  change: number;
  changePercent: number;
  isPositive: boolean;
  last: number;
  max: number;
  min: number;
}

interface PortfolioGainsState extends PortfolioGains {
  errorMessage: string;
  status: 'idle' | 'loading' | 'loaded' | 'error';
}

@Component({
  selector: 'app-cartera-section',
  templateUrl: './cartera-section.html',
  styleUrl: './cartera-section.css',
  host: {
    id: 'cartera',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteraSection implements AfterViewInit, OnDestroy {
  @ViewChild('trendCanvas') private readonly trendCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly marketService = inject(MarketService);
  private readonly platformId = inject(PLATFORM_ID);
  private chart: Chart<'line'> | null = null;
  private readonly chartReady = signal(false);
  private gainsRequestId = 0;
  private requestId = 0;

  protected readonly user = this.authService.user;
  protected readonly idToken = this.authService.idToken;
  protected readonly selectedTicker = signal<string | null>(null);
  protected readonly selectedRange = signal<TrendRange>('1d');
  protected readonly portfolioGains = signal<PortfolioGainsState>({
    costBasisSource: 'none',
    dailyGain: 0,
    errorMessage: '',
    hasCostBasis: false,
    investedCost: 0,
    source: 'yfinance',
    status: 'idle',
    totalGain: 0,
    totalValue: 0,
  });
  protected readonly trendState = signal<TrendState>({
    errorMessage: '',
    points: [],
    source: null,
    status: 'idle',
  });
  protected readonly rangeOptions: { label: string; value: TrendRange }[] = [
    { label: '1 dia', value: '1d' },
    { label: '1 semana', value: '1w' },
    { label: '1 ano', value: '1y' },
  ];
  protected readonly positions = computed<PortfolioPosition[]>(() =>
    Object.entries(this.user()?.cartera ?? {})
      .map(([ticker, quantity]) => ({
        ticker,
        quantity,
      }))
      .sort((left, right) => left.ticker.localeCompare(right.ticker)),
  );
  protected readonly assetCount = computed(() => {
    return this.positions().length;
  });
  protected readonly currentTicker = computed(() => {
    const positions = this.positions();
    const selectedTicker = this.selectedTicker();

    if (selectedTicker && positions.some((position) => position.ticker === selectedTicker)) {
      return selectedTicker;
    }

    return positions[0]?.ticker ?? null;
  });
  protected readonly selectedPosition = computed(() => {
    const currentTicker = this.currentTicker();
    return this.positions().find((position) => position.ticker === currentTicker) ?? null;
  });
  protected readonly trendSummary = computed<TrendSummary | null>(() => {
    const prices = this.trendState().points.map((point) => point.price);

    if (prices.length === 0) {
      return null;
    }

    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;

    return {
      change,
      changePercent: first === 0 ? 0 : (change / first) * 100,
      isPositive: change >= 0,
      last,
      max: Math.max(...prices),
      min: Math.min(...prices),
    };
  });

  constructor() {
    Chart.register(
      CategoryScale,
      Filler,
      Legend,
      LineController,
      LineElement,
      LinearScale,
      PointElement,
      Tooltip,
    );

    effect(() => {
      const ticker = this.currentTicker();
      const range = this.selectedRange();

      this.loadTrend(ticker, range);
    });

    effect(() => {
      const token = this.idToken();
      const positions = this.positions();

      this.loadPortfolioGains(token, positions.length);
    });

    effect(() => {
      if (!this.chartReady()) {
        return;
      }

      this.scheduleChartRender(this.trendState().points, this.currentTicker());
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.chartReady.set(true);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected selectPosition(ticker: string): void {
    this.selectedTicker.set(ticker);
  }

  protected selectRange(range: TrendRange): void {
    this.selectedRange.set(range);
  }

  protected formatNumber(value: number | undefined, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(value ?? 0);
  }

  protected signedMoney(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${this.formatNumber(value, 2)} $`;
  }

  private loadTrend(ticker: string | null, range: TrendRange): void {
    const requestId = this.requestId + 1;
    this.requestId = requestId;

    if (!ticker) {
      this.trendState.set({
        errorMessage: '',
        points: [],
        source: null,
        status: 'idle',
      });
      return;
    }

    this.trendState.set({
      errorMessage: '',
      points: [],
      source: null,
      status: 'loading',
    });

    this.marketService
      .getTrend(ticker, range)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trend) => {
          if (requestId !== this.requestId) {
            return;
          }

          this.trendState.set({
            errorMessage: '',
            points: trend.points,
            source: trend.source,
            status: 'loaded',
          });
        },
        error: () => {
          if (requestId !== this.requestId) {
            return;
          }

          this.trendState.set({
            errorMessage: 'No se pudo cargar la tendencia de la accion.',
            points: [],
            source: null,
            status: 'error',
          });
        },
      });
  }

  private loadPortfolioGains(token: string | null, positionCount: number): void {
    const requestId = this.gainsRequestId + 1;
    this.gainsRequestId = requestId;

    if (!token || positionCount === 0) {
      this.portfolioGains.set({
        costBasisSource: 'none',
        dailyGain: 0,
        errorMessage: '',
        hasCostBasis: false,
        investedCost: 0,
        source: 'yfinance',
        status: 'idle',
        totalGain: 0,
        totalValue: 0,
      });
      return;
    }

    this.portfolioGains.update((state) => ({
      ...state,
      errorMessage: '',
      status: 'loading',
    }));

    this.marketService
      .getPortfolioGains(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gains) => {
          if (requestId !== this.gainsRequestId) {
            return;
          }

          this.portfolioGains.set({
            ...gains,
            errorMessage: '',
            status: 'loaded',
          });
        },
        error: () => {
          if (requestId !== this.gainsRequestId) {
            return;
          }

          this.portfolioGains.update((state) => ({
            ...state,
            errorMessage: 'No se pudieron cargar las ganancias.',
            status: 'error',
          }));
        },
      });
  }

  private scheduleChartRender(points: TrendPoint[], ticker: string | null): void {
    window.requestAnimationFrame(() => this.renderChart(points, ticker));
  }

  private renderChart(points: TrendPoint[], ticker: string | null): void {
    const canvas = this.trendCanvas?.nativeElement;

    if (!canvas || points.length === 0) {
      this.chart?.destroy();
      this.chart = null;
      return;
    }

    const labels = points.map((point) =>
      new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        hour: this.selectedRange() === '1y' ? undefined : '2-digit',
        month: 'short',
      }).format(new Date(point.timestamp * 1000)),
    );
    const values = points.map((point) => point.price);
    const lineColor = values.at(-1)! >= values[0] ? '#047857' : '#b91c1c';
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: ticker ?? 'Activo',
            data: values,
            borderColor: lineColor,
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            borderWidth: 3,
            fill: true,
            pointRadius: 0,
            tension: 0.32,
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            intersect: false,
            mode: 'index',
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 6,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => `${this.formatNumber(Number(value), 2)} $`,
            },
          },
        },
      },
    };

    if (this.chart) {
      this.chart.data = config.data;
      this.chart.options = config.options ?? {};
      this.chart.update();
      return;
    }

    this.chart = new Chart(canvas, config);
  }
}
