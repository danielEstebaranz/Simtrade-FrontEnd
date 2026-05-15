# Arquitectura general

## Que tipo de aplicacion es

Este proyecto es una aplicacion Angular. Angular separa la aplicacion en piezas pequenas llamadas componentes, servicios, rutas y configuraciones.

La idea principal es:

- Los componentes pintan pantalla.
- Los servicios contienen logica compartida.
- Las rutas deciden que pantalla se muestra segun la URL.
- Los guards protegen rutas.
- La carpeta `public` contiene archivos estaticos que el navegador puede pedir directamente.

## Estructura importante

```text
src/app/
  app.config.ts
  app.html
  app.routes.ts
  app.ts
  components/
    sidebar/
  guards/
    auth-guard.ts
  pages/
    dashboard/
      components/
        cartera-section/
        configuracion-section/
        historial-section/
        mercado-section/
        ranking-section/
    login/
  services/
    account.ts
    auth.ts
    market.ts
    theme.ts

public/
  logo_Simtrade.jpeg
  logo_Simtrade-rounded.png
  favicon.ico
```

## Por que se organizo asi

Se eligio separar `components`, `pages`, `services` y `guards` porque cada carpeta tiene una responsabilidad clara.

- `components`: piezas reutilizables, como el sidebar.
- `pages`: pantallas completas, como login o panel.
- `services`: logica que no pertenece a una pantalla concreta, como llamar al backend.
- `guards`: reglas para permitir o bloquear navegacion.
- `services/market.ts`: llamadas al backend para obtener datos reales de mercado.
- `services/account.ts`: llamadas al backend para configuracion, fondos y borrado de cuenta.
- `services/theme.ts`: estado global del tema visual y persistencia en navegador.

Esto evita que todo acabe mezclado en `app.ts` o `app.html`. Tambien facilita seguir creciendo el proyecto: mercado, cartera, ranking y configuracion ya estan separados como componentes propios.

## App principal

Antes, `app.html` contenia directamente el layout con sidebar y contenido. Despues del login se cambio para que solo tenga:

```html
<router-outlet />
```

`router-outlet` es el hueco donde Angular pinta la pantalla activa. Si la URL es `/login`, pinta el componente de login. Si la URL empieza por `/panel`, pinta el dashboard.

Esto es mejor porque el login no debe mostrar el sidebar. El sidebar solo pertenece al panel cuando el usuario ya ha iniciado sesion.

## Router-outlet dentro del dashboard

El dashboard tambien tiene otro `router-outlet`:

```html
<router-outlet />
```

Ese segundo `router-outlet` sirve para cargar las rutas hijas del panel:

```text
/panel/cartera
/panel/mercado
/panel/historial
/panel/ranking
/panel/configuracion
```

La ruta antigua `/panel/operaciones` redirige a `/panel/mercado`. La compra de acciones se integro en mercado.
La ruta antigua `/panel/alertas` redirige a `/panel/historial`.

Asi el dashboard mantiene el sidebar y la cabecera fijos, pero el contenido central cambia segun el link pulsado.

## Flujo de cartera y grafica

La pestaña de cartera no pinta una grafica inventada en el navegador. El flujo actual es:

```text
CarteraSection -> MarketService -> FastAPI -> ApiHandler -> yfinance -> datos reales -> Chart.js
```

`CarteraSection` lee la cartera del usuario desde `AuthService`, muestra una fila por cada activo y, cuando hay un activo seleccionado, pide al backend la tendencia del ticker.

La grafica se pinta con Chart.js porque ya resuelve bien escalas, ejes, tooltips y lineas. Angular se queda como responsable de la interfaz y el estado, mientras Chart.js se encarga de dibujar en el `canvas`.

Si el backend no devuelve datos reales, el frontend muestra un error. Se elimino el fallback de datos demo porque podia confundir: parecia una grafica real aunque estuviera inventada.

## Flujo de configuracion

La pestaña de configuracion ya no es un placeholder. El flujo actual es:

```text
ConfiguracionSection -> AccountService -> FastAPI -> DbHandler -> Firestore
```

Desde esa pantalla el usuario puede:

- cambiar entre modo claro y modo oscuro
- anadir fondos al saldo disponible
- borrar la cuenta escribiendo una confirmacion

`ThemeService` aplica el tema sobre `document.documentElement` usando `data-theme`. Los estilos globales de `src/styles.css` leen esa marca y cambian colores del dashboard, sidebar, tarjetas, graficas y mensajes.

El tema se guarda en dos sitios:

- `localStorage`, para que se vea bien al recargar antes de recibir respuesta del backend
- `settings.theme` en Firestore, para que el perfil conserve la preferencia

Cuando se anaden o quitan fondos, el backend devuelve el usuario actualizado y `AuthService.updateUser(...)` refresca el saldo en toda la app.

El reinicio de cartera sigue el mismo flujo, pero exige mas seguridad:

```text
ConfiguracionSection -> AccountService -> FastAPI
FastAPI verifica token + contrasena
DbHandler vacia cartera y deja saldo en 1000 $
FastAPI devuelve user actualizado
AuthService.updateUser(...) refresca la app
```

Cuando se borra la cuenta, el frontend limpia la sesion y vuelve a `/login`.

## Catalogo de activos

Para no repetir datos entre Mercado y Cartera, se creo:

```text
src/app/services/assets.ts
```

`MercadoSection` usa esa lista para mostrar los activos disponibles. `CarteraSection` la usa para convertir el ticker guardado en Firestore a un nombre legible. Por ejemplo:

```text
AAPL -> Apple
BINANCE:BTCUSDT -> Bitcoin
```

Si llega un ticker que no esta en el catalogo, se muestra el ticker como fallback.
