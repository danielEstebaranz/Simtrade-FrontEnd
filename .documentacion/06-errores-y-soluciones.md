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

## 28. Usuario recien registrado no podia comprar

### Error

Un usuario se registraba correctamente, entraba al panel, pero al intentar comprar aparecia:

```text
Debes iniciar sesion para comprar.
```

### Causa

El backend devolvia `user` tras el registro, pero no devolvia `idToken`.

Angular guardaba el usuario en `AuthService`, por eso parecia que habia sesion, pero `idToken()` estaba vacio. Las compras necesitan ese token para llamar a:

```text
POST /users/me/portfolio/buy
```

### Solucion

El backend ahora, despues de crear el usuario en Firebase Authentication, inicia sesion automaticamente con Firebase y devuelve:

```json
{
  "user": {},
  "idToken": "...",
  "refreshToken": "..."
}
```

Ademas, el frontend considera autenticada una sesion solo si existen usuario y token:

```ts
readonly isAuthenticated = computed(() => this.userState() !== null && this.tokenState() !== null);
```

Asi no se puede entrar al panel con un usuario guardado pero sin token valido.

## 29. Configuracion existia como ruta pero no como funcionalidad real

### Problema

La ruta `/panel/configuracion` y el enlace del sidebar ya existian, pero el componente solo mostraba:

```text
Aqui podras ajustar las preferencias de la cuenta.
```

No permitia probar el modo oscuro/claro, anadir fondos ni borrar cuenta desde el frontend.

### Solucion

Se creo una pantalla completa de configuracion con:

- selector de tema claro/oscuro
- formulario de anadir fondos con validacion
- botones rapidos de 100 $, 500 $ y 1000 $
- borrado de cuenta con confirmacion `BORRAR`
- mensajes de carga, exito y error

La logica HTTP se separo en:

```text
src/app/services/account.ts
```

Y el tema global en:

```text
src/app/services/theme.ts
```

## 30. Los depositos se veian como compras en historial

### Error

Despues de anadir fondos, el backend registra una transaccion con:

```text
type = deposito
ticker = CASH
```

El frontend del historial solo distinguia venta frente a cualquier otra cosa. Por eso un deposito podia mostrarse como compra.

### Solucion

`HistorialSection` ahora distingue:

```text
compra
venta
deposito
retirada
reinicio
```

Y muestra para depositos:

```text
Has anadido 250 $ al saldo.
```

Despues, al anadir `Quitar fondos` y `Reiniciar cartera`, se amplio el historial para mostrar tambien:

```text
Has retirado 250 $ del saldo.
Has reiniciado la cartera y el saldo vuelve a 1000 $.
```

## 31. El modo oscuro no afectaba a las graficas

### Error

Las tarjetas y fondos podian cambiar con CSS, pero los ejes, grids y tooltips de Chart.js seguian usando colores pensados para modo claro.

### Causa

Chart.js pinta dentro de un `canvas`. El contenido del canvas no se actualiza automaticamente con variables CSS.

### Solucion

`CarteraSection` y `MercadoSection` leen `ThemeService.theme()` en el `effect()` que repinta la grafica y pasan colores claros u oscuros a la configuracion de Chart.js.

## 32. Build de Angular fallaba dentro del sandbox

### Error

Durante la comprobacion podia aparecer:

```text
Cannot read directory "../../..": Access is denied.
Could not resolve "@angular/ssr"
```

### Causa

El sandbox del entorno bloqueaba accesos que Angular necesita para resolver archivos, estilos y dependencias.

### Solucion

Se ejecuto la compilacion fuera del sandbox. La app compilo correctamente con:

```powershell
npm run build
```

La build solo mantuvo warnings ya existentes de presupuesto CSS en `cartera-section.css`, `mercado-section.css` y `configuracion-section.css`.

## 33. Login heredaba colores del tema oscuro

### Error

Al activar tema oscuro en la aplicacion, la pantalla de login podia verse con colores heredados del tema global. Ademas se notaban letras del logo en el fondo.

### Causa

El login estaba dentro de la misma app Angular y podia recibir variables o estilos pensados para el dashboard.

### Solucion

Se fijaron colores estaticos en `login.css`:

- fondo liso
- panel claro
- textos e inputs con colores concretos
- `color-scheme: light`

Asi el login se ve igual aunque el usuario tenga modo oscuro guardado.

## 34. Anadir fondos manual no aceptaba bien algunos importes

### Error

Los botones rapidos funcionaban, pero si el usuario escribia una cantidad manual podia no anadirse.

### Causa

El input numerico del navegador y la validacion del formulario podian tratar distinto comas, puntos o formatos locales.

### Solucion

El input paso a `type="text"` con `inputmode="decimal"`. En TypeScript se normaliza:

```ts
Number(valor.replace(',', '.'))
```

La validacion final sigue estando en frontend y backend.

## 35. Borrar cuenta aceptaba contrasena incorrecta si el backend viejo seguia arrancado

### Error

El usuario podia pensar que la cuenta se borraba aunque la contrasena introducida no fuera correcta.

### Causa

Habia riesgo de estar usando un proceso de backend antiguo en el puerto `8000`, con una version previa del endpoint.

### Solucion

Se cambio el frontend para llamar a:

```text
POST /users/me/delete
```

Y el backend verifica la contrasena con Firebase Authentication antes de borrar. Si la contrasena no corresponde al usuario autenticado, devuelve error.

## 36. Configuracion se rediseno primero como desplegable, pero no era la interfaz deseada

### Error

La primera version del redisenio de Configuracion usaba un desplegable al pasar el raton con `Perfil`, `Apariencia`, `Fondos` y `Borrar cuenta`.

### Problema de experiencia

El usuario queria una barra de seleccion lateral como las listas de Mercado/Cartera, no un menu desplegable. Ademas el desplegable no aprovechaba igual de bien el espacio.

### Solucion

Se sustituyo por una estructura de dos columnas:

```text
barra lateral interna de opciones | panel activo
```

La barra izquierda contiene botones grandes con abreviatura y nombre. El panel derecho ocupa el resto del ancho disponible. En pantallas pequenas, la estructura pasa a una sola columna.

## 37. Cartera mostraba codigos de ticker demasiado grandes

### Error

En `Acciones del usuario`, textos como `BINANCE:BTCUSDT` podian casi chocar con las unidades. Ademas el usuario preferia ver nombres reales como `Bitcoin`, `Tesla` o `Apple`.

### Solucion

Se creo:

```text
src/app/services/assets.ts
```

Ese catalogo permite convertir tickers en nombres:

```text
AAPL -> Apple
TSLA -> Tesla
BINANCE:BTCUSDT -> Bitcoin
```

Tambien se redujo el tamano de texto y la fila se cambio a grid:

```text
nombre del activo | unidades
```

Asi las unidades quedan alineadas a la derecha sin solaparse.

## 38. Nuevas operaciones de fondos necesitaban backend real

### Necesidad

En Configuracion se anadieron:

- quitar fondos
- reiniciar cartera

### Solucion

Se anadieron endpoints:

```text
POST /users/me/funds/withdraw
POST /users/me/portfolio/reset
```

`/funds/withdraw` resta saldo si el usuario tiene suficiente. `/portfolio/reset` exige token valido, palabra `REINICIAR` y contrasena correcta antes de vaciar cartera y devolver saldo a 1000 $.

En Firestore, `DbHandler` anadio:

```text
retirar_fondos(...)
reiniciar_cartera(...)
```

Ambos registran movimientos en `transacciones` para que el historial pueda reflejar lo ocurrido.

## 39. La cartera actual del perfil quedaba centrada con pocos activos

### Error

En Configuracion -> Perfil, cuando el usuario tenia una sola accion, la seccion `Cartera actual` quedaba visualmente en medio de la columna en vez de arriba. Con varias acciones parecia correcto.

### Causa

El grid de `Datos de la cuenta` y `Cartera actual` igualaba alturas. La columna de cartera tenia poco contenido, asi que su lista podia quedar centrada verticalmente y generaba un hueco innecesario.

### Solucion

Se anadio alineacion al inicio:

```css
.profile-details section {
  align-content: start;
}

.profile-positions {
  align-content: start;
}
```

Con esto, aunque solo haya una accion, la cartera actual empieza arriba.

## 40. Las retiradas no aparecian como notificacion

### Error

Al anadir fondos si aparecia una notificacion en Historial, pero al quitar fondos no aparecia con mensaje propio.

### Causa

El backend registraba `RETIRADA`, pero el frontend solo tenia mensajes especiales para `DEPOSITO`. Cualquier otro tipo podia caer en el mensaje generico de compra.

### Solucion

`HistorialSection` ahora reconoce:

```text
retirada
reinicio
```

Y muestra mensajes especificos. Tambien se anadieron clases visuales propias para diferenciar retirada y reinicio.

Ademas, el backend ajusta los calculos auxiliares:

- `RETIRADA` resta en el calculo de fondos anadidos.
- `REINICIO` limpia costes abiertos anteriores.

## 41. El color o fondo del sidebar no cambiaba al editar `sidebar.css`

### Error

Se cambiaban colores en `sidebar.css`, pero visualmente el lateral seguia igual.

### Causa

Habia reglas globales del tema oscuro que tambien pintaban el sidebar. Una regla posterior con `background` podia sobrescribir el fondo completo del componente, incluida la imagen.

### Solucion

Se centralizo la imagen con variables CSS:

```css
--sidebar-background-image
```

Y la regla global paso de `background` a `background-color`, para no borrar `background-image`.

## 42. Estadisticas no cargaba y los nuevos activos no aparecian

### Error

La pestaña mostraba:

```text
No se pudieron cargar las estadisticas de mercado.
```

Y los activos nuevos del backend no aparecian en Mercado.

### Causas

1. Seguía arrancado un proceso viejo del backend en el puerto `8000`, sin los endpoints nuevos.
2. Habia listas de activos duplicadas: una en backend y otra en frontend.

### Solucion

Se añadieron endpoints nuevos:

```text
GET /market/assets
GET /market/statistics
```

Se creo un catalogo compartido en backend para que worker y API usen los mismos activos, y Mercado paso a cargar la lista desde `/market/assets` dejando `assets.ts` solo como fallback.

## 43. El grafico de distribucion mostraba porcentajes pero no el queso

### Error

En Perfil se veian:

```text
Apple 31,12 %
NVD 68,88 %
```

pero el grafico circular no aparecia.

### Causa

Los datos ya estaban cargados, pero el `canvas` estaba dentro de un `@if`. Chart.js intentaba dibujar antes de que Angular insertara el elemento en el DOM.

### Solucion

Se programa el render en el siguiente frame:

```ts
window.requestAnimationFrame(() => this.renderCompositionChart(items));
```

Tambien se fijo un contenedor cuadrado para que el canvas tenga tamaño estable.

## 44. El chat IA fallaba si faltaba `sessionId`

### Error

El endpoint de n8n respondia con error cuando el frontend enviaba solo `chatInput`.

### Causa

El workflow usa `Simple Memory`, y esa memoria necesita un identificador de sesion.

### Solucion

Se creo `ChatService`, que siempre envia:

```json
{
  "chatInput": "texto",
  "sessionId": "simtrade-user-<id>"
}
```

Si no hay usuario autenticado, genera una sesion local persistente.

## 45. El asistente respondia preguntas ajenas a SIMTRADE

### Error

El agente respondia preguntas generales como una IA abierta.

### Solucion

Se anadio un `systemMessage` al AI Agent de n8n para limitarlo al dominio funcional del proyecto y redirigir preguntas fuera de alcance.

## 46. La respuesta del chat solo aparecia al volver a hacer clic

### Error

La IA ya habia respondido, pero el usuario solo veia el nuevo mensaje despues de volver a enfocar el textarea.

### Solucion

Se reforzo la actualizacion visual del modal y se hizo autoscroll explicito al ultimo mensaje tras:

- enviar una pregunta
- recibir una respuesta
- recibir un error
