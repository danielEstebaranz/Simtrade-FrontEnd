# Rutas y navegacion

## Rutas actuales

Archivo:

```text
src/app/app.routes.ts
```

Rutas:

```ts
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((component) => component.Login),
  },
  {
    path: 'panel',
    loadComponent: () => import('./pages/dashboard/dashboard').then((component) => component.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cartera' },
      { path: 'cartera', loadComponent: () => import('./pages/dashboard/components/cartera-section/cartera-section').then((component) => component.CarteraSection) },
      { path: 'mercado', loadComponent: () => import('./pages/dashboard/components/mercado-section/mercado-section').then((component) => component.MercadoSection) },
      { path: 'operaciones', redirectTo: 'mercado' },
      { path: 'alertas', redirectTo: 'historial' },
      { path: 'historial', loadComponent: () => import('./pages/dashboard/components/historial-section/historial-section').then((component) => component.HistorialSection) },
      { path: 'estadisticas', loadComponent: () => import('./pages/dashboard/components/estadisticas-section/estadisticas-section').then((component) => component.EstadisticasSection) },
      { path: 'ranking', redirectTo: 'estadisticas' },
      { path: 'configuracion', loadComponent: () => import('./pages/dashboard/components/configuracion-section/configuracion-section').then((component) => component.ConfiguracionSection) },
      { path: 'perfil', loadComponent: () => import('./pages/dashboard/components/perfil-section/perfil-section').then((component) => component.PerfilSection) },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
```

## Que significa cada ruta

Las rutas usan `loadComponent`. Eso significa que Angular carga cada pantalla cuando se necesita, en lugar de meter todos los componentes del panel en el bloque inicial.

### `/login`

Muestra el formulario de login y registro.

### `/panel`

Muestra el dashboard principal. Esta protegida con `authGuard`.

Dentro de `/panel` hay rutas hijas:

```text
/panel/cartera
/panel/mercado
/panel/historial
/panel/estadisticas
/panel/configuracion
/panel/perfil
```

La ruta `/panel` sin apartado redirige por defecto a `/panel/cartera`.

La ruta antigua `/panel/operaciones` se conserva solo como redireccion a `/panel/mercado`, porque las compras se hacen ahora desde mercado.
La ruta antigua `/panel/alertas` se conserva como redireccion a `/panel/historial`.
La ruta antigua `/panel/ranking` se conserva como redireccion a `/panel/estadisticas`.

### `/`

Redirige a `/login`.

### `**`

Captura cualquier ruta no encontrada y redirige a `/login`.

## Guard de autenticacion

Archivo:

```text
src/app/guards/auth-guard.ts
```

Este guard comprueba:

```ts
authService.isAuthenticated()
```

Si hay usuario, permite entrar en `/panel`.

Si no hay usuario, redirige a `/login`.

## Problema con el sidebar

Al principio los enlaces del sidebar eran asi:

```html
<a href="#cartera">
```

Parecia correcto, pero con Angular y `<base href="/">`, el navegador podia resolverlo como:

```text
/#cartera
```

Y como `/` redirige a `/login`, al pulsar un apartado del sidebar parecia que se cerraba la sesion.

## Primera solucion aplicada

Se cambio a navegacion Angular:

```html
<a routerLink="/panel" [fragment]="item.fragment">
```

Ahora los enlaces quedan asi:

```text
/panel#cartera
/panel#mercado
```

De esta manera Angular permanece en `/panel` y solo cambia el fragmento de la pagina.

## Solucion actual

Despues se cambio otra vez para que cada apartado del sidebar sea una ruta real:

```html
<a [routerLink]="['/panel', item.path]">
```

Ahora el sidebar navega a rutas como:

```text
/panel/cartera
/panel/mercado
/panel/configuracion
```

Esto es mejor que usar fragmentos porque cada apartado se comporta como una pantalla propia. Tambien permite que el usuario recargue la pagina o copie la URL y siga viendo el mismo apartado.

## Router-outlet del dashboard

El dashboard tiene:

```html
<router-outlet />
```

Ese hueco es donde Angular carga el componente hijo que corresponda:

- `/panel/cartera` carga `CarteraSection`.
- `/panel/mercado` carga `MercadoSection`.
- `/panel/operaciones` redirige a `MercadoSection`.
- `/panel/alertas` redirige a `HistorialSection`.
- `/panel/historial` carga `HistorialSection`.
- `/panel/estadisticas` carga `EstadisticasSection`.
- `/panel/ranking` redirige a `EstadisticasSection`.
- `/panel/configuracion` carga `ConfiguracionSection`.
- `/panel/perfil` carga `PerfilSection`.

## Lazy loading con `loadComponent`

El proyecto usa componentes standalone. Por eso no hace falta crear modulos de feature para tener carga diferida.

Ejemplo:

```ts
{
  path: 'configuracion',
  loadComponent: () =>
    import('./pages/dashboard/components/configuracion-section/configuracion-section').then(
      (component) => component.ConfiguracionSection,
    ),
}
```

Ventajas:

- el bundle inicial baja
- cada apartado del panel queda separado
- el codigo sigue alineado con Angular moderno

## Por que es mejor usar `routerLink`

`routerLink` trabaja con el router de Angular. Evita navegaciones raras del navegador y mantiene la aplicacion dentro del flujo de Angular.

## Opcion activa del sidebar

El sidebar calcula la ruta activa leyendo la URL actual con el `Router`. Asi sabe si estas en `cartera`, `mercado`, `historial`, etc.

Con eso aplica:

```html
[class.active]="activePath() === item.path"
[attr.aria-current]="activePath() === item.path ? 'page' : null"
```

`class.active` pinta visualmente la opcion actual.

`aria-current="page"` ayuda a lectores de pantalla a entender que ese enlace representa la pagina actual.
