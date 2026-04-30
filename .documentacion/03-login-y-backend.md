# Login y conexion con backend

## Problema inicial

El backend ya funcionaba por consola y accedia a Firestore, pero no tenia una API HTTP.

Eso significa que el navegador no podia hacer esto directamente:

```text
Angular -> funcion Python autenticar_usuario()
```

Un navegador solo puede comunicarse con el backend mediante HTTP, WebSocket u otro protocolo de red. Por eso se creo una API pequena en el backend.

## Backend creado

Archivo en el repositorio backend:

```text
../Simtrade-BackEnd/api_server.py
```

Este servidor expone:

```text
POST http://127.0.0.1:8000/auth/login
POST http://127.0.0.1:8000/auth/register
```

Internamente reutiliza:

```py
db.autenticar_usuario(username, password)
db.crear_usuario(username, password)
db.obtener_usuario(user_id)
```

Eso es importante: no se duplico la logica de Firestore. La API solo traduce peticiones HTTP a llamadas al backend que ya existia.

## Respuesta del backend

Cuando el login va bien, devuelve algo de este estilo:

```json
{
  "message": "Inicio de sesion correcto.",
  "user": {
    "id": "usuario",
    "username": "Usuario",
    "saldo": 1000,
    "cartera": {}
  }
}
```

No devuelve la contrasena. Eso es importante por seguridad.

## Servicio Angular

Archivo:

```text
src/app/services/auth.ts
```

Este servicio hace varias cosas:

- Envia login al backend.
- Envia registro al backend.
- Guarda el usuario en un `signal`.
- Guarda una copia del usuario en `localStorage` para conservar la sesion si se recarga la pagina.
- Borra la sesion al cerrar sesion.

## Por que se usa un servicio

El login no deberia saber todos los detalles de HTTP, rutas del backend o localStorage. Para eso esta `AuthService`.

Asi el componente de login solo hace:

```ts
this.authService.login(this.form.getRawValue())
```

Y el servicio se encarga del resto.

## LocalStorage y SSR

Angular en este proyecto tiene SSR/prerender. Eso significa que parte del codigo puede ejecutarse en Node, no solo en el navegador.

`localStorage` solo existe en navegador. Por eso el servicio comprueba:

```ts
isPlatformBrowser(this.platformId)
```

antes de leer o escribir en `localStorage`.

Sin esa comprobacion, la build daba este error:

```text
ReferenceError: localStorage is not defined
```

## CORS

El frontend corre en:

```text
http://127.0.0.1:4200
```

El backend corre en:

```text
http://127.0.0.1:8000
```

Como son puertos distintos, el navegador lo considera origen distinto. Por eso `api_server.py` incluye cabeceras CORS para permitir peticiones desde el frontend.
