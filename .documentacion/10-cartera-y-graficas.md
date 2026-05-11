# Cartera y graficas

## Objetivo

La pestaña `Cartera` muestra dos cosas:

- el saldo disponible del usuario
- las acciones o activos que tiene en cartera

Ademas, al seleccionar una accion, se muestra una grafica de tendencia con tres vistas:

- `1 dia`
- `1 semana`
- `1 ano`

## Archivos implicados

```text
src/app/pages/dashboard/components/cartera-section/
  cartera-section.ts
  cartera-section.html
  cartera-section.css

src/app/services/market.ts
```

En backend:

```text
../Simtrade-BackEnd/api_server.py
../Simtrade-BackEnd/services/Api_Handler.py
```

## Flujo completo

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

## Por que se usa Chart.js

Se usa Chart.js porque dibujar una grafica a mano implica resolver muchas cosas:

- ejes
- escalas
- tooltips
- area bajo la linea
- actualizaciones cuando cambian los datos
- responsive dentro del contenedor

Con Chart.js, Angular solo prepara los datos y el estado visual. Chart.js se encarga del dibujo.

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

## Estados de la grafica

La grafica tiene un estado interno:

```ts
status: 'idle' | 'loading' | 'loaded' | 'error'
```

Sirve para saber que debe mostrar la interfaz:

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

Esto es mas honesto y mas facil de depurar.

## Rangos

El frontend trabaja con:

```ts
export type TrendRange = '1d' | '1w' | '1y';
```

Y se mandan al backend como query param:

```text
/market/AAPL/trend?range=1d
/market/AAPL/trend?range=1w
/market/AAPL/trend?range=1y
```

## Datos esperados del backend

La respuesta tiene esta forma:

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

## Como se calcula el resumen

El componente calcula:

- ultimo precio
- cambio absoluto
- cambio porcentual
- minimo
- maximo

Esto se hace con `computed()` para que Angular recalcule solo cuando cambian los puntos.

## Puntos debiles

- La cartera solo sabe los tickers guardados en Firestore. Si un ticker no existe en Yahoo Finance, la grafica dara error.
- `1 semana` usa historico de dias de mercado. En acciones, fines de semana y festivos pueden no tener datos.
- Chart.js aumenta el tamano del bundle. La build funciona, pero Angular avisa de presupuesto de tamano.
- No hay cache de tendencias. Si cambias mucho de rango o activo, se hacen nuevas peticiones.
- Todavia no hay pantalla de detalle de operacion, solo vista de cartera y tendencia.

## Preguntas tipicas

### Por que no se guarda la grafica en Firestore

Porque Firestore guarda datos de usuario y mercado interno. La tendencia historica puede pedirse a una fuente de mercado cuando se necesita.

### Por que no se calcula todo en Angular

Angular no deberia hablar directamente con servicios financieros ni gestionar claves. Es mejor que el frontend pida datos al backend.

### Por que algunas acciones pueden no mostrar linea

Porque el proveedor de datos puede no reconocer el simbolo o no tener historico para ese rango.

### Por que se ve `Datos reales de mercado`

Para dejar claro que la grafica viene del backend y no de datos inventados en el navegador.
