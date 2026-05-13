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
    auth.ts
    market.ts

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
