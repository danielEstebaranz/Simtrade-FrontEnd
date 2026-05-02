import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-configuracion-section',
  template: `
    <h2>Configuracion</h2>
    <p>Aqui podras ajustar las preferencias de la cuenta.</p>
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
    id: 'configuracion',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguracionSection {
}
