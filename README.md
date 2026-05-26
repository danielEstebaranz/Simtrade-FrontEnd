# SIMTRADE FrontEnd

Frontend Angular del TFG Simtrade. Incluye autenticacion, panel protegido, cartera, mercado, bonos temporales, historial, estadisticas, perfil, configuracion y centro de ayuda con asistente virtual conectado a n8n.

## Funcionalidades principales

- Login y registro contra el backend FastAPI.
- Operativa de compra y venta de activos.
- Bonos temporales: contratacion de bonos por saldo, contador de vencimiento, liquidacion automatica y rastro en historial.
- Graficas reales con Chart.js.
- Gestion de fondos, reinicio de cartera y borrado de cuenta.
- Tema claro/oscuro persistente.
- Login con tema claro fijo aunque el usuario tenga modo oscuro guardado.
- Perfil sin mostrar identificadores internos del usuario.
- Bonos legibles en tema oscuro con reglas de contraste propias.
- FAQ y chat de soporte de SIMTRADE en `/panel/ayuda`.
- Integracion con n8n para el asistente IA mediante `src/app/services/chat.ts`.

## Secciones principales

- `/login`: acceso y registro. Mantiene estetica clara fija para evitar que el tema oscuro del panel cambie la pantalla inicial.
- `/panel/cartera`: resumen de saldo, posiciones y ganancias.
- `/panel/mercado`: listado de activos y compra por importe.
- `/panel/bonos`: ofertas de bonos, inversion por importe, bonos activos y bonos liquidados.
- `/panel/historial`: rastro de compras, ventas, depositos, retiradas, reinicios, inversiones en bonos y cierres de bonos.
- `/panel/estadisticas`: estadisticas de mercado.
- `/panel/configuracion`: tema, fondos, reinicio de cartera y borrado de cuenta.
- `/panel/ayuda`: FAQ y chat conectado a n8n.

## Bonos temporales

La pantalla de bonos usa `AccountService` para consumir:

```text
GET  /bonds/offers
GET  /users/me/bonds
POST /users/me/bonds
POST /users/me/bonds/settle
```

Flujo:

1. El usuario elige una oferta, por ejemplo Amazon.
2. Introduce la cantidad a invertir.
3. El backend descuenta el saldo y devuelve un bono activo con `maturityAt`.
4. El frontend calcula el contador con `maturityAt`, no restando a ciegas.
5. Cuando el contador llega a 0, llama a liquidar bonos vencidos.
6. El saldo se actualiza con `user` devuelto por backend.
7. Historial muestra `bono_inversion` y `bono_cierre`.

Los bonos no dependen de tener comprada la accion en cartera. Un bono de Tesla se puede contratar aunque el usuario no tenga acciones de Tesla, porque es una oferta temporal independiente de la cartera.

Estetica actual:

- Los bonos activos estan alineados a la izquierda.
- Todos usan el mismo ancho para que la lista sea simetrica.
- Los bonos liquidados aparecen en un bloque separado.

## Servicios Angular

- `AuthService`: login, registro, sesion, usuario actual y sincronizacion del tema guardado.
- `MarketService`: mercado, compra, venta, cartera, ganancias e historial.
- `AccountService`: configuracion, fondos, retiradas, reinicio, borrado de cuenta y bonos.
- `ThemeService`: aplica `data-theme` en el documento y guarda preferencia en `localStorage`.
- `ChatService`: comunica el chat de ayuda con n8n.

## Librerias usadas

- `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`: base de la aplicacion, componentes standalone, rutas y formularios reactivos.
- `@angular/common/http`: llamadas HTTP al backend FastAPI y al webhook de n8n.
- `rxjs`: manejo de observables y suscripciones HTTP.
- `chart.js`: graficas de tendencia y cartera.
- `express` y `@angular/ssr`: soporte SSR generado por Angular.
- `vitest` y `jsdom`: base disponible para tests.
- `typescript`: tipado de la aplicacion.

## Errores corregidos recientes

### Fondos manuales no se aplicaban

Los botones rapidos funcionaban, pero la cantidad escrita manualmente podia viajar como texto. El backend ahora acepta numero o texto y el frontend normaliza comas decimales antes de enviar.

### Login heredaba el modo oscuro

El login queda fijado con `color-scheme: light` y fondo claro para que el tema oscuro solo afecte al panel.

### Bonos no se liquidaban al primer contador a 0

El contador ahora se calcula con `maturityAt`. Si hay un bono vencido, el frontend llama a `settleBonds`; al recargar `/panel/bonos`, `GET /users/me/bonds` tambien liquida vencidos desde backend.

### Historial no explicaba los bonos

`HistorialSection` ahora muestra mensajes especificos para:

```text
bono_inversion
bono_cierre
```

### Bonos activos desalineados

La lista se dejo en columna simetrica, todos pegados a la izquierda y con el mismo ancho.

### Bonos con poco contraste en modo oscuro

Los textos de `Bonos temporales`, `Elige un bono` y `Bonos activos` quedaban demasiado oscuros. Se reforzaron los colores del componente en tema oscuro con `:host-context([data-theme='dark'])`.

### Perfil mostraba identificador interno

El perfil mostraba el `id` tecnico del usuario. Se retiro de la interfaz: el dato sigue disponible internamente para autenticacion y servicios, pero no se ensena al usuario final.

## Servicios locales necesarios

```text
Frontend Angular: http://localhost:4200
Backend FastAPI:  http://127.0.0.1:8000
n8n Cloud:        https://simtrade.app.n8n.cloud
```

El chat usa el workflow publicado de n8n:

```text
POST https://simtrade.app.n8n.cloud/webhook/70182b73-2c1e-49d3-b99c-41aaa164ef52/chat
```

La peticion envia `chatInput` y `sessionId`; el `sessionId` permite que la memoria del agente conserve el contexto de la conversacion.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
