# Errores encontrados y soluciones

## 1. PowerShell bloqueo `npm`

### Error

```text
No se puede cargar el archivo npm.ps1 porque la ejecucion de scripts esta deshabilitada
```

### Causa

Windows PowerShell bloqueaba el wrapper `npm.ps1`.

### Solucion

Se uso:

```powershell
npm.cmd run build
```

`npm.cmd` evita el wrapper bloqueado de PowerShell.

## 2. `ng` no se reconocia

### Error

```text
"ng" no se reconoce como un comando interno o externo
```

### Causa

No existia `node_modules`, asi que Angular CLI no estaba instalado localmente.

### Solucion

Se ejecuto:

```powershell
npm.cmd install
```

Despues `npm.cmd run build` ya podia encontrar Angular.

## 3. `spawn EPERM`

### Error

```text
An unhandled exception occurred: spawn EPERM
```

### Causa

El entorno de Windows/sandbox bloqueo procesos que Angular necesitaba lanzar.

### Solucion

Se ejecuto la build o el servidor con permisos elevados cuando hizo falta.

## 4. Favicon no cargaba

### Error

El icono no aparecia en la pestana.

### Causa

La ruta era:

```html
href="src\images\logo_Simtrade.jpeg"
```

Angular no sirve `src/images` como ruta publica y HTML no debe usar `\`.

### Solucion

Se movio/copio la imagen a `public` y se uso:

```html
href="/logo_Simtrade-rounded.png"
```

## 5. CSS no redondeaba el favicon

### Error

Se intento:

```css
icono {
  border-radius: 10px;
}
```

### Causa

El favicon no se puede redondear con CSS de la pagina.

### Solucion

Se genero una imagen PNG redondeada y se uso esa como favicon.

## 6. Imagen del sidebar no aparecia

### Causa 1

Se habia usado:

```html
<img href="...">
```

pero las imagenes no usan `href`.

### Causa 2

Habia servidores de Angular antiguos en el puerto `4200`, asi que el navegador podia estar viendo una version vieja.

### Solucion

Se cambio a:

```html
ngSrc="/logo_Simtrade-rounded.png"
```

y se reinicio el servidor Angular.

## 7. `ng-serve.log` bloqueaba cambiar de rama

### Error

```text
The following untracked working tree files would be overwritten by checkout:
  ng-serve.log
```

### Causa

El archivo `ng-serve.log` fue generado al arrancar Angular redirigiendo logs. Git no queria cambiar de rama porque ese archivo sin trackear podia ser sobrescrito.

### Solucion

Se paro el proceso que lo tenia abierto y se borro `ng-serve.log`.

## 8. No existia API HTTP para login

### Problema

El backend funcionaba por consola, pero Angular no podia llamar directamente a funciones Python.

### Solucion

Se creo `api_server.py` en el backend con endpoints HTTP:

```text
POST /auth/login
POST /auth/register
```

## 9. Error `localStorage is not defined`

### Error

```text
ReferenceError: localStorage is not defined
```

### Causa

Angular SSR/prerender ejecuta codigo en servidor, donde no existe `localStorage`.

### Solucion

Se comprobo si el codigo se ejecuta en navegador:

```ts
isPlatformBrowser(this.platformId)
```

antes de usar `localStorage`.

## 10. Al pulsar sidebar volvia al login

### Error

Despues de iniciar sesion, al pulsar `Cartera`, `Mercado`, etc., volvia a login.

### Causa

Los enlaces eran `href="#cartera"`. Con Angular podian resolverse como `/#cartera`. La ruta `/` redirige a `/login`.

### Solucion

Se cambio a:

```html
[routerLink]="['/panel', item.path]"
```

Asi los enlaces navegan a rutas reales como `/panel/cartera` o `/panel/operaciones`.

## 11. Los apartados del sidebar no funcionaban como link

### Error

Al pulsar en `Cartera`, `Operaciones`, `Configuracion`, etc., no se cargaba un componente distinto.

### Causa

Al principio se estaba usando una navegacion por fragmentos o anclas. Eso sirve para saltar dentro de la misma pagina, pero no para cargar componentes independientes.

### Solucion

Se crearon rutas hijas dentro de `/panel`:

```text
/panel/cartera
/panel/mercado
/panel/operaciones
/panel/alertas
/panel/ranking
/panel/configuracion
```

Y cada opcion del sidebar usa `routerLink`.

## 12. La grafica se veia vacia

### Error

La tarjeta de cartera mostraba el hueco de la grafica, pero no aparecia la linea.

### Causa

Chart.js pinta dentro de un `canvas`. Si Angular crea el canvas con `@if` justo cuando llegan los datos, puede ocurrir que Chart.js intente pintar antes de que el elemento este listo.

### Solucion

Se dejo el `canvas` montado cuando hay una accion seleccionada y se usan overlays para estados de carga/error:

```html
<canvas #trendCanvas class="trend-chart"></canvas>
```

Despues se programa el pintado con:

```ts
window.requestAnimationFrame(() => this.renderChart(points, ticker));
```

Asi el navegador ya ha preparado el DOM antes de dibujar.

## 13. La grafica no era real

### Error

La grafica parecia funcionar, pero podia estar usando datos generados en el frontend.

### Causa

`MarketService` tenia un fallback `createDemoTrend(...)`. Si el backend fallaba, Angular inventaba puntos de precio para que la grafica no quedara vacia.

Eso era comodo para probar el diseno, pero peligroso para entender la app, porque el usuario podia pensar que estaba viendo mercado real.

### Solucion

Se elimino el fallback demo. Ahora:

- `MarketService` solo pide datos al backend.
- Si el backend devuelve datos, se pinta la grafica.
- Si el backend falla, se muestra error.
- El backend usa `yfinance` para obtener historico real.

## 14. Backend antiguo seguia respondiendo

### Error

Despues de cambiar el backend, el endpoint seguia devolviendo `404` para la tendencia aunque la prueba directa con Python devolvia puntos reales.

### Causa

Habia un proceso viejo ocupando el puerto `8000`. El frontend llamaba a ese servidor antiguo, no al backend actualizado.

### Solucion

Se localizo el proceso del puerto `8000`, se paro y se arranco el backend nuevo. Despues:

```text
GET /market/AAPL/trend?range=1d
```

devolvio `200 OK`, `source: "yfinance"` y puntos reales.

## 15. `finnhub` bloqueaba el backend aunque la grafica usaba `yfinance`

### Error

Al probar `ApiHandler`, Python fallaba con:

```text
ModuleNotFoundError: No module named 'finnhub'
```

### Causa

`Api_Handler.py` importaba `finnhub` al inicio del archivo. Aunque la grafica real ya usaba `yfinance`, el import de Finnhub podia romper todo antes de ejecutar nada.

### Solucion

Se dejo `finnhub` como import opcional:

```py
try:
    import finnhub
except ImportError:
    finnhub = None
```

Asi el historico con `yfinance` puede funcionar aunque Finnhub no este instalado o no haya API key configurada.
