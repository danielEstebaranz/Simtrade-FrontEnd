# Conceptos Angular usados

Este documento explica las piezas de Angular usadas en el proyecto y por que se han usado.

## Component

Un componente es una pieza de interfaz.

Ejemplo:

```ts
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {}
```

Un componente puede tener:

- Selector: nombre de la etiqueta HTML personalizada.
- Template: HTML que pinta.
- Styles: CSS.
- Clase TypeScript: logica.

## Componentes standalone

En Angular moderno los componentes pueden importar directamente lo que necesitan:

```ts
imports: [RouterLink, NgOptimizedImage]
```

No hace falta crear un `NgModule` para agruparlos.

En Angular v20+ no se pone `standalone: true` porque ya es el comportamiento por defecto.

## Router

El Router de Angular permite cambiar de pantalla segun la URL.

En este proyecto las rutas estan en:

```text
src/app/app.routes.ts
```

Ejemplo:

```ts
{ path: 'login', component: Login }
```

Significa: cuando la URL sea `/login`, Angular carga el componente `Login`.

## Router-outlet

`router-outlet` es un hueco donde Angular pinta el componente de la ruta actual.

En `app.html`:

```html
<router-outlet />
```

Ese es el `router-outlet` principal. Ahi se carga:

- `Login` si estas en `/login`.
- `Dashboard` si estas en `/panel/...`.

En `dashboard.html` tambien hay otro:

```html
<router-outlet />
```

Ese es el `router-outlet` de rutas hijas. Ahi se carga:

- `CarteraSection` si estas en `/panel/cartera`.
- `MercadoSection` si estas en `/panel/mercado`.
- `OperacionesSection` si estas en `/panel/operaciones`.
- etc.

Esto permite que el dashboard mantenga sidebar y cabecera fijos mientras cambia solo el contenido central.

## Rutas hijas

Las rutas hijas son rutas dentro de otra ruta.

Ejemplo:

```ts
{
  path: 'panel',
  component: Dashboard,
  children: [
    { path: 'cartera', component: CarteraSection },
    { path: 'mercado', component: MercadoSection },
  ],
}
```

Aqui `/panel` carga `Dashboard`, y dentro de su `router-outlet` se carga la seccion hija.

## RouterLink

`routerLink` sirve para navegar usando Angular, sin recargar toda la pagina.

En el sidebar:

```html
<a [routerLink]="['/panel', item.path]">
```

Si `item.path` es `cartera`, el enlace lleva a:

```text
/panel/cartera
```

Es mejor que usar `href` normal porque Angular controla la navegacion.

## Guard

Un guard decide si una ruta se puede abrir o no.

Archivo:

```text
src/app/guards/auth-guard.ts
```

Uso:

```ts
{ path: 'panel', component: Dashboard, canActivate: [authGuard] }
```

Si el usuario esta autenticado, permite entrar.

Si no, redirige a `/login`.

## Signals

`signal()` guarda estado reactivo.

Ejemplo del sidebar:

```ts
protected readonly activePath = signal(this.getActivePath());
```

Cuando cambia la ruta, se actualiza `activePath`. La plantilla lo usa para pintar la opcion activa:

```html
[class.active]="activePath() === item.path"
```

## Computed

`computed()` calcula un valor a partir de otros datos.

Ejemplo en cartera:

```ts
protected readonly assetCount = computed(() => {
  const cartera = this.user()?.cartera ?? {};
  return Object.keys(cartera).length;
});
```

Sirve para no repetir esa logica en el HTML.

## Input

`input()` permite que un componente reciba datos desde su padre.

Se llego a usar en `CarteraSection` cuando el dashboard pasaba el saldo y activos. Despues se cambio para que `CarteraSection` lea directamente desde `AuthService`, porque ahora es una ruta hija independiente.

## Inject

`inject()` sirve para pedir servicios a Angular.

Ejemplo:

```ts
private readonly authService = inject(AuthService);
```

Se usa en vez de constructor injection porque es una forma moderna y clara en Angular actual.

## Reactive Forms

El login usa formularios reactivos:

```ts
protected readonly form = this.formBuilder.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  password: ['', [Validators.required, Validators.minLength(4)]],
});
```

Ventajas:

- Validaciones claras.
- Facil comprobar si el formulario es invalido.
- Facil mostrar errores.
- Mejor para formularios que creceran.

## HttpClient

`HttpClient` permite llamar al backend por HTTP.

En `AuthService` se usa:

```ts
this.http.post<AuthResponse>(`${this.apiUrl}${path}`, payload)
```

Asi Angular puede llamar a:

```text
http://127.0.0.1:8000/auth/login
http://127.0.0.1:8000/auth/register
```

Tambien se usa en `MarketService` para obtener la grafica real:

```ts
this.http.get<TrendResponse>(url, { params })
```

`params` se usa para mandar el rango:

```text
range=1d
range=1w
range=1y
```

## Observable y subscribe

Las peticiones HTTP de Angular devuelven un `Observable`. Un `Observable` representa algo que todavia no ha llegado.

En cartera se usa:

```ts
this.marketService.getTrend(ticker, range).subscribe({
  next: (trend) => { ... },
  error: () => { ... },
});
```

- `next`: entra cuando el backend devuelve datos correctos.
- `error`: entra cuando el backend responde con error o no se puede conectar.

Se usa `takeUntilDestroyed(this.destroyRef)` para que Angular limpie la suscripcion cuando el componente desaparece.

## ViewChild y canvas

Chart.js necesita un elemento HTML `canvas` real para poder dibujar.

En `CarteraSection` se usa:

```ts
@ViewChild('trendCanvas')
private readonly trendCanvas?: ElementRef<HTMLCanvasElement>;
```

Esto permite acceder al canvas definido en el HTML:

```html
<canvas #trendCanvas></canvas>
```

Importante: el canvas se deja montado mientras hay una accion seleccionada. Antes estaba dentro de condiciones y podia aparecer demasiado tarde, dejando la grafica vacia.

## effect

`effect()` ejecuta codigo cuando cambian las signals que se leen dentro.

En cartera se usa para:

- pedir nuevos datos cuando cambia el ticker o el rango.
- repintar la grafica cuando llegan nuevos puntos.

Esto evita tener que llamar manualmente a varios metodos desde muchos sitios.

## Chart.js

Chart.js no es de Angular, es una libreria JavaScript para graficas.

En el componente se registra lo necesario:

```ts
Chart.register(CategoryScale, LineController, LineElement, LinearScale, PointElement, Tooltip);
```

Luego se crea una grafica:

```ts
this.chart = new Chart(canvas, config);
```

Si ya existe una grafica, se actualizan datos y opciones en vez de crear otra encima. Asi se evita acumular graficas y memoria.

## LocalStorage

`localStorage` guarda datos en el navegador.

Se usa para conservar la sesion si se recarga la pagina.

Como el proyecto usa SSR/prerender, antes de usarlo se comprueba que estamos en navegador:

```ts
isPlatformBrowser(this.platformId)
```

Esto evita errores durante la build.

## NgOptimizedImage

`NgOptimizedImage` es una utilidad de Angular para imagenes.

En vez de:

```html
<img src="/logo_Simtrade-rounded.png">
```

se usa:

```html
<img ngSrc="/logo_Simtrade-rounded.png" width="768" height="768" alt="Simtrade">
```

Angular puede optimizar mejor la carga y exige declarar `width` y `height`, lo cual ayuda a evitar saltos visuales.

## ChangeDetectionStrategy.OnPush

Se pone en componentes:

```ts
changeDetection: ChangeDetectionStrategy.OnPush
```

Ayuda al rendimiento porque Angular revisa menos veces el componente. Encaja bien con signals y datos claros.
