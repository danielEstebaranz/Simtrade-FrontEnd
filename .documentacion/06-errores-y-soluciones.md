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

Mas adelante se elimino la pestaña visual `Operaciones`. La ruta `/panel/operaciones` se conserva como redireccion a `/panel/mercado`.

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

## 16. El puerto 8000 ya estaba ocupado

### Error

Al arrancar el backend aparecio:

```text
[WinError 10048] solo se permite un uso de cada direccion de socket
```

### Causa

Ya habia un proceso de backend escuchando en:

```text
127.0.0.1:8000
```

Windows no permite dos procesos usando el mismo host y puerto.

### Solucion

Se busco el proceso:

```powershell
netstat -ano | Select-String ":8000"
```

Y se paro el PID que estaba en `LISTENING`:

```powershell
Stop-Process -Id <PID> -Force
```

Despues se pudo arrancar el backend de nuevo.

## 17. `FIREBASE_WEB_API_KEY` no estaba configurada

### Error

En el login aparecio:

```text
Falta configurar FIREBASE_WEB_API_KEY en el entorno.
```

### Causa

El archivo `.env` del backend tenia `FINNHUB_API_KEY` y `FIREBASE_JSON_PATH`, pero faltaba `FIREBASE_WEB_API_KEY`.

Esa clave es necesaria para que el backend pueda iniciar sesion contra Firebase Authentication usando `signInWithPassword`.

### Solucion

Anadir al `.env` del backend:

```env
FIREBASE_WEB_API_KEY=tu_api_key_de_firebase
```

La clave se obtiene en Firebase Console:

```text
Configuracion del proyecto -> General -> App web -> apiKey
```

Despues hay que reiniciar el backend para que lea el `.env` actualizado.

## 18. Firestore se conectaba dos veces al arrancar el backend

### Error

Al ejecutar `api_server.py` salia dos veces:

```text
Conexion establecida con Firebase Firestore.
```

### Causa

El script arrancaba Uvicorn con:

```py
uvicorn.run('api_server:app', ...)
```

Cuando se ejecuta el archivo directamente, eso puede provocar una segunda importacion del modulo.

### Solucion

Se cambio a:

```py
uvicorn.run(app, host=HOST, port=PORT, reload=False)
```

Asi Uvicorn usa la instancia `app` ya creada y no reimporta el archivo.

## 19. `Ganancias totales` aparecia como `Sin coste`

### Error

La tarjeta de cartera mostraba:

```text
Ganancias totales: Sin coste
```

### Causa

El backend no encontraba historial de transacciones para calcular el dinero invertido real.

Ademas, la consulta a Firestore intentaba ordenar por `fecha` directamente en la query, lo que puede requerir indice o fallar segun la estructura.

### Solucion

Se cambio la lectura de transacciones para:

1. consultar por usuario
2. ordenar en Python
3. calcular el coste abierto por compras y ventas
4. si no hay historial valido, estimar con `1000 - saldo actual`

## 20. Ganancia total positiva y ganancia diaria negativa parecia contradictorio

### Duda

El usuario vio algo como:

```text
Ganancia total: +0,02 $
Ganancia diaria: -0,06 $
```

### Explicacion

No es contradictorio:

- la total compara contra el precio de compra o coste invertido
- la diaria compara contra el inicio del dia

Ejemplo:

```text
Compraste por:        10,00 $
Ahora vale:           10,02 $
Ganancia total:       +0,02 $

Al empezar el dia:    10,08 $
Ahora vale:           10,02 $
Ganancia diaria:      -0,06 $
```

La cartera sigue ganando respecto a la compra, aunque hoy haya bajado.

## 21. Compra desde mercado devolvia `Not Found`

### Error

Al pulsar `Comprar` en mercado, el popup mostraba:

```text
Not Found
```

### Causa

El frontend ya intentaba llamar al endpoint de compra, pero el backend arrancado en el puerto `8000` era una version anterior que todavia no tenia:

```text
POST /users/me/portfolio/buy
```

### Solucion

Se reinicio el backend para cargar el endpoint actualizado.

## 22. La compra pedia acciones en vez de dinero

### Error

El popup pedia `Cantidad`, lo que se interpretaba como numero de acciones o unidades.

### Causa

La primera version enviaba `quantity` al backend.

### Solucion

Se cambio el flujo para pedir dinero a invertir:

```json
{
  "ticker": "AAPL",
  "amount": 10
}
```

El backend obtiene el ultimo precio real y calcula:

```text
unidades compradas = dinero invertido / precio actual
```

## 23. El input del popup sobresalia del modal

### Error

El campo editable del popup de compra se salia horizontalmente del contenedor.

### Causa

El input tenia `width: 100%`, padding y borde, pero sin `box-sizing: border-box`.

### Solucion

Se anadio:

```css
.buy-dialog,
.buy-dialog * {
  box-sizing: border-box;
}
```

Asi el ancho incluye padding y borde, y el input queda centrado dentro del popup.

## 24. Venta desde cartera: el importe no parecia exacto

### Duda

Al vender el 25 % de una posicion que visualmente rondaba los 100 $, el resultado fue aproximadamente:

```text
24,66 $
```

### Causa

La pantalla muestra el valor con el ultimo precio consultado para la tendencia. Al vender, el backend vuelve a pedir el precio real actual antes de ejecutar la operacion.

Si el precio cambia entre la visualizacion y la venta, el importe final cambia tambien.

### Solucion

Se cambio la metrica de la tendencia:

```text
Dinero invertido -> Valor actual
```

Asi el usuario ve el valor de mercado de esa posicion en ese momento, que es el dato mas util antes de vender.

## 25. El sidebar no llegaba hasta abajo al hacer scroll

### Error

Al bajar por la pantalla, el lateral oscuro terminaba antes que el contenido y se veia fondo blanco debajo.

### Causa

El sidebar tenia:

```css
min-height: 100dvh;
```

Eso cubre solo la altura visible inicial, no necesariamente todo el documento cuando el contenido es mas largo.

### Solucion

Se hizo que el sidebar se comporte como elemento pegado al viewport:

```css
:host {
  position: sticky;
  top: 0;
}

.sidebar {
  height: 100dvh;
}
```

En movil se desactiva para que el menu no quede fijo arriba ocupando demasiado espacio.

## 26. La solucion inicial del sidebar dejaba un corte raro

### Error

Despues de intentar pintar una franja oscura fija detras del sidebar, aparecio un corte visual porque la franja no coincidia exactamente con el ancho real del sidebar.

### Causa

Se uso un `linear-gradient` con una medida fija. Si el ancho real, el zoom del navegador o el layout variaban, quedaba un escalon.

### Solucion

Se sustituyo por una solucion mas robusta:

```css
.app-shell {
  background: #111827;
}

.main-content {
  background: #f8fafc;
  min-width: 0;
}
```

El contenedor completo tiene fondo oscuro y el contenido principal pinta encima su zona clara. Asi el lateral queda oscuro hasta abajo sin depender de calculos de ancho.

## 27. Caracter raro en el cierre del popup de venta

### Error

El boton de cerrar del popup de venta mostro un caracter mal codificado.

### Causa

Se uso un caracter especial para la cruz de cierre y el archivo termino mostrando mojibake.

### Solucion

Se sustituyo por texto ASCII:

```html
x
```

Es mas simple y evita problemas de codificacion.
