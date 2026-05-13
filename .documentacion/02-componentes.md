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
- Enlaces de navegacion: Cartera, Mercado, Alertas, Ranking y Configuracion.

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
  { label: 'Cartera', fragment: 'cartera', icon: 'CA' },
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
- Saldo disponible.
- Numero de activos en cartera.
- Secciones placeholder para futuras funciones.
- Boton de cerrar sesion.

### Por que el sidebar esta aqui y no en App

Porque el sidebar solo debe aparecer cuando el usuario ya esta dentro. Si estuviera en `app.html`, tambien apareceria en login, que no es deseado.
