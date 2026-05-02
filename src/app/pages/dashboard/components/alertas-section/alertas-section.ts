import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-alertas-section',
  template: `
    <h2>Alertas</h2>
    <p>Aqui se mostraran avisos y notificaciones.</p>
  `,
  styles: `
    :host {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      display: block;
      padding: 1.25rem;
      scroll-margin-top: 1rem;
    }

    h2 {
      color: #111827;
      font-size: 1.2rem;
      margin: 0 0 0.5rem;
    }

    p {
      color: #4b5563;
      margin: 0;
    }
  `,
  host: {
    id: 'alertas',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertasSection {
}
