import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-cartera-section',
  template: `
    <article class="summary-card">
      <p>Saldo disponible</p>
      <strong>{{ user()?.saldo ?? 0 }} $</strong>
    </article>

    <article class="summary-card">
      <p>Activos en cartera</p>
      <strong>{{ assetCount() }}</strong>
    </article>
  `,
  styles: `
    :host {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      max-width: 42rem;
      scroll-margin-top: 1rem;
    }

    .summary-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.25rem;
    }

    p {
      color: #4b5563;
      margin: 0 0 0.5rem;
    }

    strong {
      color: #111827;
      font-size: 1.8rem;
    }
  `,
  host: {
    id: 'cartera',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteraSection {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.user;
  protected readonly assetCount = computed(() => {
    const cartera = this.user()?.cartera ?? {};
    return Object.keys(cartera).length;
  });
}
