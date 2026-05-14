# Librerias, metodologia y FAQ

## Librerias usadas en el frontend

### Angular

Es el framework principal. Se usa para:

- componentes
- rutas
- guards
- formularios reactivos
- servicios
- signals
- llamadas HTTP

Se ha seguido el estilo moderno de Angular:

- componentes standalone
- `inject()` en vez de constructor injection
- `signal()` y `computed()` para estado
- `ChangeDetectionStrategy.OnPush`
- control flow moderno con `@if` y `@for`

### Chart.js

Se usa para la grafica de cartera.

Motivo: hacer una grafica desde cero seria mas largo y mas facil de romper. Chart.js ya trae ejes, escalas, tooltip, linea, area y comportamiento responsive.

### RxJS

Angular lo usa en `HttpClient`. Las peticiones HTTP devuelven `Observable`.

Se usa `takeUntilDestroyed(...)` para limpiar suscripciones cuando el componente se destruye.

### NgOptimizedImage

Se usa en imagenes estaticas como el logo del sidebar.

Ayuda a declarar anchura y altura y evita saltos visuales.

## Librerias usadas en el backend

### FastAPI

Se usa para crear la API HTTP que consume Angular.

Motivos:

- rutas faciles de leer
- validacion automatica con Pydantic
- respuestas JSON sencillas
- documentacion automatica en `/docs`

### Uvicorn

Servidor que ejecuta FastAPI.

### firebase-admin

Permite acceder a Firestore desde Python.

Se usa para usuarios, saldo, cartera, mercado e historial.

### requests

Se usa en `api_server.py` para llamar al endpoint oficial de Firebase Authentication `signInWithPassword`.

### python-dotenv

Carga variables desde `.env`, por ejemplo:

```text
FIREBASE_JSON_PATH
FINNHUB_API_KEY
SIMTRADE_API_HOST
SIMTRADE_API_PORT
```

### finnhub-python

Se conserva para precio actual y worker de precios.

### yfinance

Se anadio para obtener historicos reales de mercado de forma sencilla.

Se usa en la grafica de cartera, porque permite pedir historico sin montar a mano una integracion compleja.

## Metodologia seguida

### 1. Separar responsabilidades

Cada pieza tiene un trabajo claro:

- `AuthService`: login, registro y sesion.
- `MarketService`: datos de mercado.
- `AccountService`: configuracion, fondos y borrado de cuenta.
- `ThemeService`: tema claro/oscuro y persistencia local.
- `MercadoSection`: consulta de activos y compra por importe.
- `CarteraSection`: interfaz, estado de cartera, grafica, valor actual y ventas.
- `ConfiguracionSection`: preferencias de cuenta, anadir fondos y borrado.
- `ApiHandler`: proveedor de mercado.
- `DbHandler`: Firestore.
- `api_server.py`: capa HTTP.

Esto evita que un componente Angular acabe sabiendo demasiado de Firestore o de proveedores externos.

### 2. Empezar simple y hacer real lo importante

Al principio una grafica demo puede servir para probar diseno, pero cuando el usuario pregunta por la realidad del dato, se cambia el criterio:

- no simular datos
- no esconder errores
- mostrar solo datos reales

### 3. Usar librerias ya hechas

Se eligio Chart.js para graficas y yfinance para historicos. La idea es no reinventar piezas comunes.

### 4. Comprobar por capas

Para depurar la grafica se comprobo:

```text
1. build de Angular
2. llamada directa Python a ApiHandler
3. endpoint HTTP del backend
4. reinicio del servidor que estaba ocupando el puerto
```

Esto permite saber si el fallo esta en Angular, en FastAPI, en Python o en el proceso arrancado.

### 5. Priorizar dato real y usar fallback solo si hace falta

Para `Ganancias totales`, el criterio final es:

1. usar historial real de transacciones si existe
2. si no existe o no es suficiente, estimar con `1000 - saldo actual`

Esto evita mostrar `Sin coste` cuando se puede dar una estimacion razonable, pero sigue priorizando el dato real.

## Errores corregidos importantes

### La grafica se veia vacia

Se corrigio dejando el `canvas` disponible y pintando con `requestAnimationFrame`.

### La grafica no era real

Se elimino el fallback demo del frontend y se conecto la tendencia a `yfinance`.

### Backend viejo en puerto 8000

Habia un proceso antiguo sirviendo la API. Se paro y se arranco el nuevo.

### `finnhub` podia romper el import

Se dejo como import opcional para que el historico con `yfinance` no dependa de tener Finnhub instalado.

### Host `localhost`

Se permitio `localhost:4200` porque el navegador estaba usando esa URL y no solo `127.0.0.1`.

### `FIREBASE_WEB_API_KEY` faltaba en el entorno

El backend necesita esa clave para llamar a Firebase Authentication con `signInWithPassword`. Debe estar en el `.env` del backend.

### Ganancias totales salia como `Sin coste`

El backend no encontraba historial de compras. Se cambio la consulta de transacciones y se anadio fallback con `1000 - saldo actual`.

### Venta desde cartera

Se anadio venta por porcentaje desde la propia cartera:

- 25 %
- 50 %
- 75 %
- porcentaje personalizado con popup

La venta se ejecuta contra el backend con precio real actual. Por eso el importe puede variar ligeramente respecto al valor que se estaba viendo en pantalla.

### Sidebar no llegaba hasta abajo

Se corrigio usando `position: sticky` en el sidebar y fondo oscuro en `.app-shell`. El contenido principal pinta su propio fondo claro, evitando cortes al hacer scroll.

### Ganancia total positiva y diaria negativa

Se aclaro que no es un error: la total compara contra la compra; la diaria compara contra el inicio del dia.

### Compra en mercado devolvia `Not Found`

El backend que estaba arrancado era antiguo y no tenia el endpoint `POST /users/me/portfolio/buy`. Se reinicio el backend.

### Popup de compra desbordado

El input sobresalia del modal. Se corrigio con `box-sizing: border-box`.

### Configuracion seguia siendo un placeholder

La ruta `/panel/configuracion` existia y el sidebar enlazaba correctamente, pero el componente solo mostraba texto estatico.

Se sustituyo por una pantalla funcional conectada al backend:

- `GET /users/me/settings`
- `PATCH /users/me/settings`
- `POST /users/me/funds`
- `DELETE /users/me`

Ademas se separo la logica en `AccountService` y `ThemeService`.

### Depositos aparecian como compras en historial

Al anadir fondos, el backend registra una transaccion `DEPOSITO`. El historial del frontend trataba cualquier movimiento que no fuera `venta` como compra.

Se anadio una etiqueta y mensaje especifico:

```text
Deposito -> Has anadido 250 $ al saldo.
```

### Canvas de Chart.js no cambiaba automaticamente con el tema

El CSS global cambia tarjetas y textos, pero los ejes y tooltips de Chart.js se dibujan dentro de un `canvas`.

Se hizo que `CarteraSection` y `MercadoSection` lean `ThemeService.theme()` dentro del `effect()` que repinta la grafica. Asi Chart.js recibe colores distintos en claro y oscuro.

### `ng build` fallaba dentro del sandbox

En el entorno de trabajo, Angular podia mostrar errores como:

```text
Cannot read directory "../../..": Access is denied.
Could not resolve "@angular/ssr"
```

No era un fallo del codigo de la app, sino del sandbox al resolver archivos y dependencias. La build se ejecuto fuera del sandbox y compilo correctamente.

## Puntos debiles actuales

- La sesion del frontend se guarda en `localStorage`. Para produccion seria mejor usar una estrategia mas robusta, por ejemplo cookies seguras o renovacion controlada de tokens.
- La autenticacion ya vive en Firebase Authentication; Firestore no debe volver a guardar contrasenas.
- La API ya permite comprar desde mercado y vender desde cartera.
- No hay cache de historicos de mercado.
- No hay cache de calculo de ganancias.
- No hay tests automatizados todavia.
- `Chart.js` sube el tamano del bundle y Angular avisa de presupuesto.
- El tema oscuro esta implementado con variables CSS y overrides globales; si se crean nuevos componentes, deben usar esas variables o anadir sus propios estados de tema.
- Si Yahoo Finance no reconoce un ticker, no hay grafica para ese activo.
- El frontend depende de que backend este encendido en `127.0.0.1:8000`.
- Si no hay historial de compras, las ganancias totales usan una estimacion basada en saldo inicial de 1000 $.
- El valor actual mostrado y el importe vendido pueden diferir si el precio cambia entre la carga de la grafica y la ejecucion de la venta.
- Borrar cuenta es irreversible. En el frontend se exige escribir `BORRAR`, pero la proteccion definitiva es que el backend exige token valido.

## Preguntas tipicas cubiertas

### Por que Angular no llama directamente a Firestore

Porque eso expondria demasiada logica en el navegador. El backend debe centralizar reglas y acceso a datos.

### Por que hay dos servicios en frontend

Porque autenticacion y mercado son temas distintos. Separarlos ayuda a mantener el codigo.

### Por que se usa `router-outlet`

Porque permite que Angular pinte la pantalla activa segun la URL.

### Por que el sidebar usa `routerLink`

Porque `routerLink` navega con Angular sin recargar toda la pagina.

### Por que se usa `localStorage`

Para no perder la sesion al recargar. Es una solucion sencilla para desarrollo.

### Por que no se usa una grafica hecha a mano

Porque Chart.js ya resuelve bien el problema y reduce codigo propio.

### Por que algunas graficas no salen

Porque el ticker puede no existir en el proveedor, no tener historico o estar en un formato distinto.

### Por que se compra desde Mercado y no desde Operaciones

Porque mercado es donde el usuario consulta el activo, su precio y su tendencia. Comprar desde ahi reduce pasos y evita una pestaña separada para una sola accion.

### Por que la compra pide dinero y no acciones

Porque para el usuario es mas natural decir cuanto dinero quiere invertir. El backend convierte ese importe a unidades usando el precio real actual.

### Por que la venta pide porcentaje y no dinero

Porque en cartera el usuario ya tiene una posicion abierta. Vender el 25 %, 50 % o 75 % permite reducir una posicion sin calcular manualmente unidades.

### Por que se muestra `Valor actual` en cartera

Porque al vender interesa saber cuanto vale la posicion ahora mismo:

```text
valor actual = unidades * ultimo precio real
```

Antes se mostro `Dinero invertido`, pero ese dato sirve mas para analisis de rentabilidad que para decidir una venta inmediata.

### Que significan `1d`, `1w` y `1y`

Son rangos de tiempo:

- `1d`: un dia
- `1w`: una semana de mercado
- `1y`: un ano

### Donde se cambia la URL del backend

En:

```text
src/app/services/auth.ts
src/app/services/market.ts
src/app/services/account.ts
```

Actualmente apuntan a:

```text
http://127.0.0.1:8000
```

### Por que puede haber ganancia total positiva y ganancia diaria negativa

Porque no miden lo mismo. La total mide desde la compra o coste invertido; la diaria mide solo el movimiento del dia.

### Por que aparece `FIREBASE_WEB_API_KEY`

Porque el login usa Firebase Authentication desde el backend. Esa clave web es necesaria para llamar a `signInWithPassword`. Debe estar en el `.env` del backend y no hardcodeada en el codigo.

### Como se guarda el modo oscuro

El frontend guarda el tema en:

```text
localStorage -> simtrade_theme
Firestore -> usuarios/{uid}.settings.theme
```

`localStorage` permite aplicar el tema al recargar. Firestore permite recuperar la preferencia del perfil cuando el backend responde.

### Por que anadir fondos esta en Configuracion

Porque no es una operacion de mercado sobre un activo, sino una operacion de cuenta. Por eso vive junto a preferencias y acciones sensibles como borrar cuenta.

### Por que borrar cuenta pide escribir BORRAR

Porque es una accion destructiva. El boton queda deshabilitado hasta que el usuario escribe la palabra exacta, reduciendo clics accidentales.
