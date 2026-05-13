# Cartera, graficas y ganancias

## Objetivo

La pestana `Cartera` muestra:

- saldo disponible
- activos en cartera
- ganancias totales
- ganancias diarias
- lista de acciones del usuario
- grafica de tendencia del activo seleccionado
- valor actual del activo seleccionado
- acciones de venta por porcentaje

La grafica tiene tres vistas:

- `1 dia`
- `1 semana`
- `1 ano`

## Archivos implicados

Frontend:

```text
src/app/pages/dashboard/components/cartera-section/
  cartera-section.ts
  cartera-section.html
  cartera-section.css

src/app/services/market.ts
```

Backend:

```text
../Simtrade-BackEnd/api_server.py
../Simtrade-BackEnd/services/Api_Handler.py
../Simtrade-BackEnd/services/db_handler.py
```

## Flujo de grafica

```text
Usuario abre Cartera
  -> CarteraSection lee user().cartera desde AuthService
  -> se pinta una fila por cada ticker
  -> se selecciona el primer ticker por defecto
  -> MarketService pide la tendencia al backend
  -> FastAPI recibe GET /market/{ticker}/trend
  -> ApiHandler pide historico real con yfinance
  -> el backend devuelve puntos de precio
  -> Chart.js dibuja la linea en el canvas
```

## Flujo de ganancias

```text
CarteraSection
  -> lee el idToken desde AuthService
  -> MarketService llama a GET /users/me/portfolio/gains
  -> FastAPI valida Authorization: Bearer <idToken>
  -> DbHandler lee cartera y transacciones
  -> ApiHandler consulta precios reales con yfinance
  -> backend calcula ganancia total y diaria
  -> backend devuelve tambien positions[ticker].totalValue
  -> frontend pinta tarjetas en verde, rojo o neutro
```

## Tarjetas superiores

La parte superior de cartera tiene cuatro rectangulos:

- `Saldo disponible`
- `Activos en cartera`
- `Ganancias totales`
- `Ganancias diarias`

Las ganancias se colorean asi:

- verde si son positivas
- rojo si son negativas
- neutro si son cero o no calculables

## Ganancias totales

Representan lo ganado o perdido desde la compra:

```text
ganancias totales = valor actual de cartera - dinero invertido
```

Para calcular `dinero invertido`, el backend sigue esta prioridad:

1. Usa el historial real de compras y ventas.
2. Si no hay historial valido, estima con `1000 - saldo actual`.

El backend devuelve el origen del calculo en `costBasisSource`:

```text
history          -> coste calculado con historial real
balance_estimate -> coste estimado con saldo inicial menos saldo actual
none             -> no se pudo calcular
```

## Ganancias diarias

Representan solo el movimiento del dia:

```text
ganancias diarias = cantidad en cartera * (ultimo precio del dia - primer precio del dia)
```

No se suman automaticamente al final del dia dentro de `ganancias totales`. Son metricas distintas.

Es normal que tengan signos diferentes:

```text
Compraste por:        10,00 $
Ahora vale:           10,02 $
Ganancia total:       +0,02 $

Al empezar el dia:    10,08 $
Ahora vale:           10,02 $
Ganancia diaria:      -0,06 $
```

Eso significa que en total sigues ganando, pero hoy ha bajado.

## Endpoint de ganancias

```text
GET /users/me/portfolio/gains
```

Requiere token:

```text
Authorization: Bearer <idToken>
```

Respuesta orientativa:

```json
{
  "costBasisSource": "history",
  "dailyGain": -0.06,
  "hasCostBasis": true,
  "investedCost": 10.0,
  "positions": {
    "AAPL": {
      "costBasisSource": "history",
      "dailyGain": 0.42,
      "hasCostBasis": true,
      "investedCost": 44.10,
      "totalGain": 1.72,
      "totalValue": 45.82
    }
  },
  "source": "yfinance",
  "totalGain": 0.02,
  "totalValue": 10.02
}
```

## Valor actual del activo seleccionado

En la tarjeta de tendencia se muestra `Valor actual`.

Este dato no es el dinero invertido originalmente, sino lo que vale en ese momento la posicion seleccionada:

```text
valor actual = unidades en cartera * ultimo precio real
```

Se cambio de `Dinero invertido` a `Valor actual` porque para vender es mas util saber cuanto vale ahora mismo la posicion. Por ejemplo, si tienes aproximadamente 100 $ en Bitcoin y vendes el 25 %, el resultado puede ser 24,66 $ porque el precio fluctua entre compra, visualizacion y venta.

El dato sale de:

```ts
selectedPositionGains().totalValue
```

que viene del backend dentro de:

```json
{
  "positions": {
    "BINANCE:BTCUSDT": {
      "totalValue": 37.0
    }
  }
}
```

## Venta desde cartera

La pestana `Operaciones` se elimino como opcion visual del sidebar. Las compras se hacen desde `Mercado` y las ventas desde `Cartera`.

En cartera, junto a los filtros de rango de la grafica, hay cuatro opciones de venta:

- `25%`
- `50%`
- `75%`
- `...`

Las tres primeras venden directamente ese porcentaje del activo seleccionado.

La opcion `...` abre un popup donde el usuario introduce un porcentaje personalizado.

Flujo:

```text
Usuario selecciona activo en Cartera
  -> pulsa 25%, 50%, 75% o ...
  -> CarteraSection llama a MarketService.sellAsset(...)
  -> MarketService envia POST /users/me/portfolio/sell
  -> backend calcula unidades a vender segun porcentaje
  -> backend obtiene precio real actual
  -> DbHandler actualiza saldo y cartera
  -> frontend actualiza AuthService con el usuario devuelto
```

La venta se hace por porcentaje, no por dinero exacto. El dinero recibido depende del precio real en el momento de ejecutar la venta.

## Por que vender el 25 % puede no dar exactamente el 25 % visual anterior

El valor mostrado en pantalla se calcula con el ultimo precio consultado.

Cuando se confirma la venta, el backend vuelve a consultar precio real para ejecutar la operacion.

Si el precio cambio entre ambos momentos, el resultado puede variar ligeramente:

```text
valor visto en pantalla: 100,00 $
venta del 25 % esperada: 25,00 $
precio baja antes de vender
venta real: 24,66 $
```

Esto es normal en una app que usa precios reales.

## Por que se usa Chart.js

Se usa Chart.js porque dibujar una grafica a mano implica resolver:

- ejes
- escalas
- tooltips
- area bajo la linea
- actualizaciones cuando cambian los datos
- responsive dentro del contenedor

Con Chart.js, Angular prepara los datos y el estado visual. Chart.js se encarga del dibujo.

## Por que se usa un canvas

Chart.js pinta sobre un elemento HTML llamado `canvas`:

```html
<canvas #trendCanvas class="trend-chart"></canvas>
```

`#trendCanvas` es una referencia local de Angular. En TypeScript se recupera con `ViewChild`:

```ts
@ViewChild('trendCanvas')
private readonly trendCanvas?: ElementRef<HTMLCanvasElement>;
```

El canvas se deja montado mientras hay una accion seleccionada. Antes, si se creaba tarde con `@if`, Chart.js podia intentar pintar antes de que el elemento existiera y la grafica quedaba vacia.

## Estados de la grafica

```ts
status: 'idle' | 'loading' | 'loaded' | 'error'
```

- `idle`: todavia no hay activo seleccionado.
- `loading`: se estan cargando datos reales.
- `loaded`: llegaron puntos desde backend.
- `error`: no se pudieron cargar datos.

## Por que se quito la grafica demo

Antes existia un metodo en frontend que generaba puntos falsos si el backend fallaba.

Eso ayudaba a probar el diseno, pero era mala idea para la aplicacion final porque la grafica parecia real.

Ahora la regla es:

- si hay datos reales, se pinta la grafica
- si no hay datos reales, se muestra error

## Rangos

```ts
export type TrendRange = '1d' | '1w' | '1y';
```

Se mandan al backend como query param:

```text
/market/AAPL/trend?range=1d
/market/AAPL/trend?range=1w
/market/AAPL/trend?range=1y
```

## Datos esperados de tendencia

```json
{
  "ticker": "AAPL",
  "range": "1d",
  "points": [
    {
      "timestamp": 1778506200,
      "price": 291.23
    }
  ],
  "source": "yfinance"
}
```

`timestamp` viene en segundos Unix. En frontend se transforma a fecha con:

```ts
new Date(point.timestamp * 1000)
```

Se multiplica por `1000` porque JavaScript trabaja con milisegundos.

## Puntos debiles

- Si no hay historial de compras, las ganancias totales usan estimacion con saldo inicial de 1000 $.
- La estimacion funciona para el proyecto actual, pero no es tan exacta como guardar coste medio por activo.
- El valor actual y la venta pueden diferir ligeramente porque se consulta precio real en momentos distintos.
- La cartera solo sabe los tickers guardados en Firestore. Si un ticker no existe en Yahoo Finance, la grafica dara error.
- `1 semana` usa historico de dias de mercado. En acciones, fines de semana y festivos pueden no tener datos.
- Chart.js aumenta el tamano del bundle. La build funciona, pero Angular avisa de presupuesto de tamano.
- No hay cache de tendencias ni de ganancias.

## Preguntas tipicas

### Por que no se guarda la grafica en Firestore

Porque Firestore guarda datos de usuario y mercado interno. La tendencia historica puede pedirse a una fuente de mercado cuando se necesita.

### Por que no se calcula todo en Angular

Angular no deberia hablar directamente con servicios financieros ni gestionar claves. Es mejor que el frontend pida datos al backend.

### Por que algunas acciones pueden no mostrar linea

Porque el proveedor de datos puede no reconocer el simbolo o no tener historico para ese rango.

### Por que se ve `Datos reales de mercado`

Para dejar claro que la grafica viene del backend y no de datos inventados en el navegador.

### Por que puede salir una ganancia total positiva y una diaria negativa

Porque comparan contra momentos distintos. La total compara contra la compra; la diaria compara contra el inicio del dia.

### Por que antes salia `Sin coste`

Porque no se encontraba historial de transacciones para calcular el precio de compra. Se corrigio anadiendo un fallback con `1000 - saldo actual`.

### Por que ahora se muestra `Valor actual` y no `Dinero invertido`

Porque la accion principal de esa zona es vender. Para decidir una venta, interesa ver el valor de mercado de la posicion ahora mismo, no el coste historico de compra.
