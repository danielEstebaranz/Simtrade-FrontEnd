# Componentes

## Que es un componente en Angular

Un componente normalmente tiene tres archivos:

- `.ts`: logica del componente.
- `.html`: estructura visual.
- `.css`: estilos.

En este proyecto se estan usando componentes standalone, que es la forma moderna de Angular. Por eso no hay `NgModule`.

Tambien se usa:

- `ChangeDetectionStrategy.OnPush` para mejorar rendimiento.
- `signal()` para estado local simple.
- `computed()` para valores derivados.
- `inject()` en vez de inyectar dependencias por constructor.

## Sidebar

Ruta:

```text
src/app/components/sidebar/
```

Archivos:

```text
sidebar.ts
sidebar.html
sidebar.css
```

### Que hace

El sidebar muestra:

- Logo de Simtrade centrado arriba.
- Enlaces de navegacion: Cartera, Mercado, Historial, Estadisticas y Configuracion.

La antigua pestaña `Operaciones` se elimino del sidebar. La compra de acciones vive ahora dentro de `Mercado`.

### Altura y scroll

El sidebar se dejo como elemento pegado al viewport:

```css
:host {
  position: sticky;
  top: 0;
}

.sidebar {
  height: 100dvh;
}
```

Esto corrige el problema de que, al hacer scroll hacia abajo en pantallas largas como cartera, la barra lateral dejara de cubrir toda la altura visible.

El fondo oscuro continuo no depende solo del sidebar. Tambien se pinta desde el layout del dashboard:

```css
.app-shell {
  background: #111827;
}

.main-content {
  background: #f8fafc;
}
```

Asi no aparecen cortes blancos debajo del menu ni franjas mal alineadas.

### Por que se hizo como componente

El sidebar es una pieza que no deberia mezclarse con el dashboard. Separarlo permite:

- Reutilizarlo en otras pantallas si hace falta.
- Cambiar su diseno sin tocar el login.
- Mantener mas limpio el `dashboard.html`.

### Estado del menu

En `sidebar.ts` el menu esta en un `signal`:

```ts
protected readonly menuItems = signal<SidebarItem[]>([
  { label: 'Cartera', path: 'cartera', icon: 'CA' },
  ...
]);
```

Un `signal` es una forma moderna de Angular para guardar datos reactivos. Aqui se usa para tener la lista de enlaces del sidebar.

### Logo

El logo se pinta con `NgOptimizedImage`:

```html
<img
  class="logo"
  ngSrc="/logo_Simtrade-rounded.png"
  width="768"
  height="768"
  alt="Simtrade"
  priority
>
```

Se usa `NgOptimizedImage` porque Angular lo recomienda para imagenes estaticas. Ayuda a que Angular entienda mejor tamano, carga y optimizacion de imagenes.

## Login

Ruta:

```text
src/app/pages/login/
```

### Que hace

El componente `Login` muestra un formulario con:

- Usuario.
- Contrasena.
- Boton para entrar.
- Cambio entre modo login y modo registro.
- Mensajes de error.

### Por que usa Reactive Forms

Se eligio `ReactiveFormsModule` porque Angular recomienda formularios reactivos para formularios con validaciones y logica.

El formulario se define en TypeScript:

```ts
protected readonly form = this.formBuilder.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  password: ['', [Validators.required, Validators.minLength(4)]],
});
```

Ventajas:

- Las validaciones estan claras.
- Es facil saber si el formulario es valido.
- Se puede marcar todo como tocado si el usuario pulsa enviar sin rellenar.

## Dashboard

Ruta:

```text
src/app/pages/dashboard/
```

### Que hace

El dashboard es la pantalla que se muestra despues del login. Contiene:

- Sidebar.
- Saludo con el nombre de usuario.
- Un `router-outlet` donde se cargan Cartera, Mercado, Historial, Estadisticas, Configuracion o Perfil.
- Icono redondo de perfil a la izquierda del boton de cerrar sesion.
- Boton de cerrar sesion.

### Por que el sidebar esta aqui y no en App

Porque el sidebar solo debe aparecer cuando el usuario ya esta dentro. Si estuviera en `app.html`, tambien apareceria en login, que no es deseado.

## Perfil

Ruta:

```text
src/app/pages/dashboard/components/perfil-section/
```

### Que hace

`PerfilSection` se saco de Configuracion para que los ajustes no mezclen datos de consulta con acciones de cuenta.

Muestra:

- resumen en columna con saldo disponible, numero de activos y tema actual
- datos de la cuenta
- cartera actual
- grafica tipo queso con la distribucion de la cartera por valor actual

La distribucion no usa simplemente unidades, porque `0,1` Bitcoin y `0,1` Apple no representan el mismo dinero. Usa:

```text
porcentaje = valor actual de la posicion / valor actual total de la cartera
```

La grafica se pinta con Chart.js usando un grafico `doughnut`.

### Problema corregido

Al principio se veian las leyendas y porcentajes, pero no el queso. Los datos ya existian, pero Angular aun no habia insertado el `canvas` cuando Chart.js intentaba dibujar.

La solucion fue esperar al siguiente frame del navegador:

```ts
window.requestAnimationFrame(() => this.renderCompositionChart(items));
```

## Configuracion

Ruta:

```text
src/app/pages/dashboard/components/configuracion-section/
```

Archivos:

```text
configuracion-section.ts
configuracion-section.html
configuracion-section.css
```

### Que hace

`ConfiguracionSection` muestra una pantalla real de ajustes de cuenta:

- barra lateral interna de seleccion, parecida a la lista de activos de Mercado
- apartado `Apariencia` con selector de tema claro/oscuro
- apartado `Fondos` con anadir fondos, quitar fondos y reiniciar cartera
- botones rapidos de 100 $, 500 $ y 1000 $
- zona de borrado de cuenta con confirmacion escribiendo `BORRAR`

La primera version del redisenio se hizo con un desplegable al pasar el raton. Despues se cambio a una barra lateral porque encaja mejor con el estilo del resto de la aplicacion y aprovecha mejor el ancho: opciones a la izquierda y contenido activo a la derecha.

### Fondos y reinicio de cartera

En fondos hay dos operaciones normales:

- `Anadir fondos`: suma saldo disponible.
- `Quitar fondos`: resta saldo disponible, siempre que haya saldo suficiente.

Tambien existe `Reiniciar cartera`. Es una accion sensible porque borra los activos actuales y devuelve el saldo a 1000 $. Por eso exige dos pasos:

1. escribir `REINICIAR` en mayusculas
2. confirmar la contrasena en un popup

La comprobacion importante se hace en el backend. El frontend solo ayuda a evitar clics accidentales.

### Servicios usados

Usa:

- `AuthService` para leer y actualizar el usuario actual
- `AccountService` para llamar a los endpoints de configuracion, fondos, reinicio y borrado
- `ThemeService` para aplicar el tema de forma global
- `Router` para volver a `/login` despues de borrar la cuenta

### Por que usa Reactive Forms

El formulario de fondos usa `ReactiveFormsModule` con validadores:

```ts
amount: ['', [Validators.required]]
```

La cantidad se normaliza despues aceptando coma o punto decimal. Asi se evita que el navegador bloquee ciertos formatos locales. La validacion importante sigue estando tambien en la API.

### Accesibilidad

La pantalla usa:

- `aria-labelledby` para nombrar secciones
- `role="tablist"` y `role="tab"` en la barra lateral interna
- `role="group"` en grupos de botones como cantidades rapidas
- `aria-pressed` en el selector claro/oscuro
- mensajes con `role="alert"` y `role="status"`
- foco visible en botones e inputs

El boton de borrado permanece deshabilitado hasta que el usuario escribe `BORRAR`.
El boton de reinicio permanece deshabilitado hasta que el usuario escribe `REINICIAR`.

## Estadisticas

Ruta:

```text
src/app/pages/dashboard/components/estadisticas-section/
```

### Que hace

Sustituye la antigua pestaña de `Ranking`.

Muestra:

- mejor rendimiento diario
- peor rendimiento diario
- mejor rendimiento semanal
- peor rendimiento semanal
- listados completos diarios y semanales

El frontend recibe los datos ya agregados desde:

```text
GET /market/statistics
```

Asi el componente solo se ocupa de presentar la informacion y no repite calculos de mercado.

## Catalogo de activos

Se anadio:

```text
src/app/services/assets.ts
```

Este archivo mantiene un fallback local de activos legibles:

```text
AAPL -> Apple
TSLA -> Tesla
AMZN -> Amazon
MSFT -> Microsoft
BINANCE:BTCUSDT -> Bitcoin
HINKF -> HINKF
GOOGL -> Alphabet
```

La fuente principal de activos disponibles es ahora el backend:

```text
GET /market/assets
```

`assets.ts` se conserva como fallback para que la interfaz tenga nombres legibles aunque el backend no responda. Antes Mercado tenia una lista duplicada dentro del componente y Cartera mostraba directamente el codigo del ticker. Ahora Mercado pregunta al backend y Cartera traduce los tickers a nombres como `Apple`, `Tesla`, `Bitcoin` o `Alphabet`.

Tambien se redujo el tamano del texto en la fila de cartera y se cambio la fila a una cuadricula con dos columnas: nombre flexible a la izquierda y unidades fijas a la derecha. Esto evita que el nombre choque con la cantidad de unidades.
