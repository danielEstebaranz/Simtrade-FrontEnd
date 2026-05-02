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
        alertas-section/
        cartera-section/
        configuracion-section/
        mercado-section/
        operaciones-section/
        ranking-section/
    login/
  services/
    auth.ts

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
/panel/operaciones
/panel/alertas
/panel/ranking
/panel/configuracion
```

Asi el dashboard mantiene el sidebar y la cabecera fijos, pero el contenido central cambia segun el link pulsado.
