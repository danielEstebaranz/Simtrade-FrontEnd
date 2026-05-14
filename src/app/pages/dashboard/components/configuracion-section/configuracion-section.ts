import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../../services/account';
import { AuthService } from '../../../../services/auth';
import { AppTheme, ThemeService } from '../../../../services/theme';

interface ActionState {
  errorMessage: string;
  status: 'idle' | 'loading' | 'saving' | 'success' | 'error';
  successMessage: string;
}

@Component({
  selector: 'app-configuracion-section',
  imports: [ReactiveFormsModule],
  templateUrl: './configuracion-section.html',
  styleUrl: './configuracion-section.css',
  host: {
    id: 'configuracion',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionSection {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  protected readonly user = this.authService.user;
  protected readonly theme = this.themeService.theme;
  protected readonly assetCount = computed(() => Object.keys(this.user()?.cartera ?? {}).length);
  protected readonly themeOptions: { label: string; value: AppTheme }[] = [
    { label: 'Claro', value: 'light' },
    { label: 'Oscuro', value: 'dark' },
  ];
  protected readonly quickFundAmounts = [100, 500, 1000];
  protected readonly deleteConfirmation = signal('');
  protected readonly canDeleteAccount = computed(() => {
    return this.deleteConfirmation().trim().toUpperCase() === 'BORRAR';
  });
  protected readonly settingsState = signal<ActionState>({
    errorMessage: '',
    status: 'idle',
    successMessage: '',
  });
  protected readonly fundsState = signal<ActionState>({
    errorMessage: '',
    status: 'idle',
    successMessage: '',
  });
  protected readonly deleteState = signal<ActionState>({
    errorMessage: '',
    status: 'idle',
    successMessage: '',
  });
  protected readonly fundsForm = this.formBuilder.group({
    amount: ['', [Validators.required, Validators.min(0.01), Validators.max(100000)]],
  });

  constructor() {
    this.loadSettings();
  }

  protected selectTheme(theme: AppTheme): void {
    const token = this.authService.idToken();

    this.themeService.setTheme(theme);

    if (!token) {
      this.settingsState.set({
        errorMessage: 'Debes iniciar sesion para guardar el tema.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    this.settingsState.set({
      errorMessage: '',
      status: 'saving',
      successMessage: '',
    });

    this.accountService
      .updateSettings(token, theme)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authService.updateUser(response.user);
          this.settingsState.set({
            errorMessage: '',
            status: 'success',
            successMessage: 'Tema actualizado.',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.settingsState.set({
            errorMessage: this.getErrorMessage(error, 'No se pudo guardar el tema.'),
            status: 'error',
            successMessage: '',
          });
        },
      });
  }

  protected setQuickFundAmount(amount: number): void {
    this.fundsForm.controls.amount.setValue(String(amount));
    this.fundsState.set({
      errorMessage: '',
      status: 'idle',
      successMessage: '',
    });
  }

  protected addFunds(): void {
    const token = this.authService.idToken();
    const amount = Number(this.fundsForm.controls.amount.value.replace(',', '.'));

    if (!token) {
      this.fundsState.set({
        errorMessage: 'Debes iniciar sesion para anadir fondos.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    if (this.fundsForm.invalid || !Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      this.fundsForm.markAllAsTouched();
      this.fundsState.set({
        errorMessage: 'Introduce una cantidad entre 0,01 y 100000.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    this.fundsState.set({
      errorMessage: '',
      status: 'saving',
      successMessage: '',
    });

    this.accountService
      .addFunds(token, amount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authService.updateUser(response.user);
          this.fundsForm.reset();
          this.fundsState.set({
            errorMessage: '',
            status: 'success',
            successMessage: `Fondos anadidos: ${this.formatNumber(response.operation.amount, 2)} $.`,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.fundsState.set({
            errorMessage: this.getErrorMessage(error, 'No se pudieron anadir fondos.'),
            status: 'error',
            successMessage: '',
          });
        },
      });
  }

  protected updateDeleteConfirmationFromEvent(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.deleteConfirmation.set(input?.value ?? '');
    this.deleteState.set({
      errorMessage: '',
      status: 'idle',
      successMessage: '',
    });
  }

  protected deleteAccount(): void {
    const token = this.authService.idToken();

    if (!token) {
      this.deleteState.set({
        errorMessage: 'Debes iniciar sesion para borrar la cuenta.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    if (!this.canDeleteAccount()) {
      this.deleteState.set({
        errorMessage: 'Escribe BORRAR para confirmar.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    this.deleteState.set({
      errorMessage: '',
      status: 'saving',
      successMessage: '',
    });

    this.accountService
      .deleteAccount(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.authService.logout();
          void this.router.navigateByUrl('/login');
        },
        error: (error: HttpErrorResponse) => {
          this.deleteState.set({
            errorMessage: this.getErrorMessage(error, 'No se pudo borrar la cuenta.'),
            status: 'error',
            successMessage: '',
          });
        },
      });
  }

  protected formatNumber(value: number | undefined, maximumFractionDigits = 2): string {
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(value ?? 0);
  }

  private loadSettings(): void {
    const token = this.authService.idToken();

    if (!token) {
      this.settingsState.set({
        errorMessage: 'Debes iniciar sesion para cargar la configuracion.',
        status: 'error',
        successMessage: '',
      });
      return;
    }

    this.settingsState.set({
      errorMessage: '',
      status: 'loading',
      successMessage: '',
    });

    this.accountService
      .getSettings(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.authService.updateUser(response.user);
          this.themeService.setTheme(response.settings.theme);
          this.settingsState.set({
            errorMessage: '',
            status: 'success',
            successMessage: '',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.settingsState.set({
            errorMessage: this.getErrorMessage(error, 'No se pudo cargar la configuracion.'),
            status: 'error',
            successMessage: '',
          });
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'No se puede conectar con el backend.';
    }

    return fallback;
  }
}
