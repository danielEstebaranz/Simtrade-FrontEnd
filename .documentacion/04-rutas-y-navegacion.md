# Rutas y navegacion

## Rutas actuales

Archivo:

```text
src/app/app.routes.ts
```

Rutas:

```ts
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'panel', component: Dashboard, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
```

## Que significa cada ruta

### `/login`

Muestra el formulario de login y registro.

### `/panel`

Muestra el dashboard principal. Esta protegida con `authGuard`.

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

## Solucion aplicada

Se cambio a navegacion Angular:

```html
<a routerLink="/panel" [fragment]="item.fragment">
```

Ahora los enlaces quedan asi:

```text
/panel#cartera
/panel#mercado
/panel#operaciones
```

De esta manera Angular permanece en `/panel` y solo cambia el fragmento de la pagina.

## Por que es mejor usar `routerLink`

`routerLink` trabaja con el router de Angular. Evita navegaciones raras del navegador y mantiene la aplicacion dentro del flujo de Angular.
