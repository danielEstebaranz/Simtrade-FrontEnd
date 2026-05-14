# Estructura del proyecto

Este documento explica la estructura actual del frontend y para que sirve cada parte importante.

## Arbol principal

```text
Simtrade-FrontEnd/
  .documentacion/
  public/
  src/
    app/
      components/
      guards/
      pages/
      services/
      app.config.ts
      app.html
      app.routes.ts
      app.ts
    index.html
    main.ts
    styles.css
  angular.json
  package.json
  package-lock.json
  tsconfig.json
```

## `.documentacion/`

Contiene la documentacion del proyecto. No forma parte de la app que se ejecuta en el navegador, pero ayuda a entender como esta construida.

## `public/`

Contiene archivos estaticos que el navegador puede pedir directamente.

Archivos actuales:

```text
public/favicon.ico
public/logo_Simtrade.jpeg
public/logo_Simtrade-rounded.png
```

Si un archivo esta en `public/logo_Simtrade-rounded.png`, se puede usar en HTML como:

```html
<img src="/logo_Simtrade-rounded.png" alt="Simtrade">
```

## `src/app/`

Es la carpeta principal de la aplicacion Angular.

### `app.ts`

Es el componente raiz de Angular. Ahora es muy simple porque solo carga:

```html
<router-outlet />
```

La idea es que las rutas decidan si se muestra login, dashboard u otra pantalla.

### `app.html`

Plantilla del componente raiz. Contiene el `router-outlet` principal.

### `app.routes.ts`

Define las rutas de la aplicacion:

- `/login`
- `/panel/cartera`
- `/panel/mercado`
- `/panel/historial`
- `/panel/ranking`
- `/panel/configuracion`

Las rutas principales y las rutas hijas usan `loadComponent`, asi que cada pantalla se carga bajo demanda.

`/panel/operaciones` queda como redireccion a `/panel/mercado`.
`/panel/alertas` queda como redireccion a `/panel/historial`.

### `app.config.ts`

Configura proveedores globales de Angular:

- Router.
- HttpClient.
- Hidratacion del cliente.
- Manejadores globales de errores.

## `src/app/components/`

Contiene componentes reutilizables.

Actualmente:

```text
components/sidebar/
```

El sidebar se considera reutilizable porque no pertenece a una seccion concreta. Lo usa el dashboard para navegar entre apartados.

## `src/app/guards/`

Contiene guards de rutas.

Actualmente:

```text
guards/auth-guard.ts
```

Este guard impide entrar al panel si el usuario no ha iniciado sesion.

## `src/app/pages/`

Contiene pantallas completas.

Actualmente:

```text
pages/login/
pages/dashboard/
```

### `pages/login/`

Pantalla de login y registro.

Archivos:

```text
login.ts
login.html
login.css
```

### `pages/dashboard/`

Pantalla principal despues de iniciar sesion. Contiene el sidebar, la cabecera y un `router-outlet` para cargar las secciones hijas.

Archivos:

```text
dashboard.ts
dashboard.html
dashboard.css
```

## Componentes internos del dashboard

Estan en:

```text
src/app/pages/dashboard/components/
```

Componentes actuales:

```text
cartera-section/
configuracion-section/
historial-section/
mercado-section/
ranking-section/
```

Cada carpeta contiene el componente de una seccion del sidebar.

La razon de separarlos es que cada apartado pueda crecer por separado. La compra de activos se integro en `mercado-section`, asi el usuario consulta el activo y compra desde la misma pantalla.
El historial de compras y ventas se integro en `historial-section`.

## `src/app/services/`

Contiene servicios compartidos.

Actualmente:

```text
services/account.ts
services/auth.ts
services/market.ts
services/theme.ts
```

`AuthService` centraliza login, registro, cierre de sesion y almacenamiento del usuario.

`MarketService` centraliza las llamadas de mercado. Ahora mismo se usa para pedir al backend la tendencia real de un activo:

```text
GET http://127.0.0.1:8000/market/{ticker}/trend?range=1d
GET http://127.0.0.1:8000/market/{ticker}/trend?range=1w
GET http://127.0.0.1:8000/market/{ticker}/trend?range=1y
GET http://127.0.0.1:8000/users/me/portfolio/gains
POST http://127.0.0.1:8000/users/me/portfolio/buy
POST http://127.0.0.1:8000/users/me/portfolio/sell
```

Se separa de `AuthService` porque autenticacion y mercado son responsabilidades distintas. Asi, si mas adelante se anaden precios, busqueda de activos o detalles de empresa, pueden crecer en `MarketService` sin mezclarlo con login.

`AccountService` centraliza las llamadas de cuenta y configuracion:

```text
GET http://127.0.0.1:8000/users/me/settings
PATCH http://127.0.0.1:8000/users/me/settings
POST http://127.0.0.1:8000/users/me/funds
DELETE http://127.0.0.1:8000/users/me
```

Se separa de `MarketService` porque anadir fondos, cambiar tema o borrar cuenta no son operaciones de mercado.

`ThemeService` guarda el tema actual como signal, lo aplica al documento HTML y lo persiste en `localStorage`.

## Dependencias relevantes del frontend

### Angular

Framework principal del frontend. Gestiona componentes, rutas, formularios, servicios HTTP, signals e hidratacion.

### Chart.js

Libreria usada para pintar la grafica de tendencia de cartera. Se instalo porque evita hacer a mano ejes, escalas, tooltip, linea y area bajo la curva.

### RxJS

Angular usa RxJS para las llamadas HTTP. `MarketService.getTrend(...)` devuelve un `Observable` y `CarteraSection` se suscribe a el para actualizar el estado cuando llega la respuesta.

`AccountService` tambien devuelve `Observable` en sus operaciones. `ConfiguracionSection` usa `takeUntilDestroyed(...)` para limpiar suscripciones al salir de la pantalla.

### Reactive Forms

Angular Forms se usa en login y en el formulario de fondos de configuracion. Permite validar la cantidad antes de llamar al backend.

## Archivos de configuracion

### `angular.json`

Configuracion general de Angular CLI: build, serve, assets, estilos y SSR.

### `package.json`

Define scripts y dependencias.

Scripts importantes:

```json
"start": "ng serve",
"build": "ng build",
"test": "ng test"
```

### `tsconfig.json`

Configuracion de TypeScript.
