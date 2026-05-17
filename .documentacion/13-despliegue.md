# Despliegue de Simtrade

Este documento recoge el plan recomendado para publicar Simtrade en internet y dejarlo preparado para una presentacion sin depender del ordenador local.

## Objetivo

Poder abrir una URL publica del frontend y usar:

- login y registro
- cartera, mercado, historial, estadisticas, perfil y configuracion
- Firestore y Firebase Authentication
- graficas y datos de mercado reales
- chat IA conectado a n8n

## Arquitectura recomendada

```text
Usuario
  -> Frontend Angular publicado
      -> Backend FastAPI publicado
          -> Firebase Authentication
          -> Firestore
          -> yfinance / Finnhub

      -> n8n publico
          -> workflow del chat IA
```

## Recomendacion de alojamiento

### Opcion recomendada para la presentacion

```text
Frontend: Vercel o Netlify
Backend: Render
Chat IA: n8n Cloud
Base de datos y autenticacion: Firebase
```

Motivo:

- el frontend se sirve de forma muy simple
- Render encaja bien con FastAPI
- n8n Cloud evita tener que mantener un servidor adicional para la demo
- Firebase ya esta en la nube y no necesita migracion

### Opcion con menos cambios inmediatos en frontend

```text
Frontend SSR: Render como servicio Node
Backend: Render como servicio Python
Chat IA: n8n Cloud
```

Esta opcion aprovecha que el proyecto Angular actual tiene SSR configurado con:

```json
"outputMode": "server"
```

Es valida, pero deja mas servicios vivos y por eso es algo mas compleja que publicar el frontend como SPA estatica.

## Estado actual que impide desplegar tal cual

### URLs locales hardcodeadas

Actualmente el frontend usa direcciones locales en varios servicios:

```text
src/app/services/auth.ts
src/app/services/account.ts
src/app/services/market.ts
src/app/services/chat.ts
```

Ejemplos:

```text
http://127.0.0.1:8000
http://localhost:5678/webhook/...
```

En internet no funcionarian, porque cada navegador intentaria llamar a su propio ordenador.

### CORS local

El backend permite ahora:

```text
http://127.0.0.1:4200
http://localhost:4200
```

Cuando el frontend tenga dominio publico, ese dominio tambien debera estar permitido.

### Backend preparado para local

El backend arranca por defecto con:

```text
127.0.0.1:8000
```

En cloud debe escuchar en:

```text
0.0.0.0:$PORT
```

### n8n local

El chat apunta hoy a:

```text
http://localhost:5678/webhook/...
```

Eso solo funciona en desarrollo.

### Credenciales de Firebase

El backend usa variables como:

```text
FIREBASE_WEB_API_KEY
FIREBASE_JSON_PATH
FINNHUB_API_KEY
```

En produccion no se debe depender de un `.env` local ni subir secretos al repositorio.

## Cambios necesarios antes de desplegar

## 1. Configuracion por entornos en Angular

Crear:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

Ejemplo de desarrollo:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000',
  chatUrl: 'http://localhost:5678/webhook/70182b73-2c1e-49d3-b99c-41aaa164ef52/chat',
};
```

Ejemplo de produccion:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://simtrade-api.onrender.com',
  chatUrl: 'https://n8n-publico/webhook/...',
};
```

Despues, sustituir las URLs fijas en:

- `AuthService`
- `AccountService`
- `MarketService`
- `ChatService`

por:

```ts
environment.apiUrl
environment.chatUrl
```

## 2. CORS configurable en FastAPI

En vez de mantener una lista fija de origenes, leerlos desde una variable:

```text
ALLOWED_ORIGINS=http://localhost:4200,https://simtrade.vercel.app
```

Asi se puede mantener desarrollo y produccion sin editar codigo cada vez.

## 3. Host y puerto cloud en backend

El comando de arranque del servicio publicado debe ser:

```bash
uvicorn api_server:app --host 0.0.0.0 --port $PORT
```

## 4. Secretos y credenciales

Configurar en el proveedor cloud:

```text
FIREBASE_WEB_API_KEY
FINNHUB_API_KEY
ALLOWED_ORIGINS
```

Recomendacion para Firebase Admin:

- no subir el JSON al repositorio
- preferir una variable tipo `FIREBASE_CREDENTIALS_JSON`
- adaptar el backend para leer credenciales desde JSON en entorno si existe

## 5. Dominio autorizado en Firebase

Cuando exista la URL publica del frontend, anadir su dominio en Firebase Authentication.

Ejemplo:

```text
simtrade.vercel.app
```

## 6. Chat IA en produccion

Mover la URL de n8n a `environment.chatUrl`.

Usar:

- webhook de produccion, no de test
- workflow activo
- CORS permitido para el dominio real del frontend

Si n8n se autoaloja:

- usar HTTPS
- configurar dominio publico
- definir `WEBHOOK_URL`
- comprobar que el reverse proxy no genera URLs internas

## 7. Rutas si el frontend pasa a SPA estatica

Si se decide publicar como SPA estatica, configurar rewrite de rutas para que:

```text
/panel/cartera
/panel/perfil
/panel/estadisticas
```

sean servidas por `index.html` al refrescar.

## 8. Endpoint de salud recomendado

Es recomendable anadir:

```text
GET /health
```

que devuelva un JSON simple. Sirve para:

- comprobar si el backend esta despierto
- configurar health checks
- depurar rapidamente antes de una demo

## Orden recomendado de trabajo

1. Crear configuracion por entornos en Angular.
2. Hacer CORS configurable en FastAPI.
3. Preparar credenciales cloud de Firebase.
4. Desplegar backend.
5. Probar endpoints reales del backend publicado.
6. Desplegar frontend.
7. Autorizar dominio en Firebase.
8. Publicar o conectar n8n.
9. Probar todo desde modo incognito y desde otra red.
10. Preparar cuenta demo y plan de respaldo.

## Comprobaciones despues de desplegar

### Frontend

- login
- registro
- navegacion
- rutas al refrescar
- imagenes del sidebar
- tema claro/oscuro
- perfil
- estadisticas
- ayuda y chat

### Backend

- `/market/assets`
- `/market/statistics`
- `/auth/login`
- `/auth/register`
- compra
- venta
- historial
- configuracion

### Firebase

- dominio autorizado
- usuario demo
- lectura y escritura correctas

### n8n

- workflow activo
- webhook de produccion
- CORS correcto
- `sessionId` conservado

## Riesgos y soluciones

### Backend dormido por plan gratuito

Riesgo:

- primera peticion lenta

Soluciones:

- abrir la app antes de presentar
- hacer login unos minutos antes
- considerar un plan de pago temporal si la demo es critica

### Datos de mercado externos

Riesgo:

- `yfinance` puede tardar, fallar o no devolver datos para algun ticker

Soluciones:

- usar para demo activos ya comprobados
- tener una cuenta demo con datos cargados
- mantener mensajes de error claros
- valorar cache ligera mas adelante

### Chat IA

Riesgos:

- URL local
- webhook de test
- workflow inactivo
- CORS incorrecto

Soluciones:

- `chatUrl` por entorno
- webhook de produccion
- workflow activo
- dominio del frontend permitido

### Secretos

Riesgo:

- subir `.env` o JSON de Firebase al repositorio

Soluciones:

- usar variables secretas del proveedor
- mantener `.gitignore`
- revisar el repositorio antes de publicar

## Preparacion para el dia de la presentacion

### Antes de empezar

- abrir la URL publica
- iniciar sesion
- visitar todas las pestañas
- probar una compra pequena
- probar el chat
- dejar una cuenta demo con datos visuales buenos

### Plan de respaldo

- una cuenta demo ya creada
- capturas de pantallas importantes
- una grabacion corta del flujo principal
- segunda pestaña con sesion ya iniciada

## Chat IA y documentacion del proyecto

### Que sabe ahora mismo

El asistente actual no consulta documentos propios del proyecto.

Su conocimiento depende principalmente de:

- el mensaje de sistema configurado en n8n
- la FAQ escrita dentro del frontend
- el contexto de la conversacion conservado con `sessionId`

Por eso puede explicar el uso general de SIMTRADE si ese contenido esta incluido en el prompt, pero no conoce automaticamente todos los `.md` de `.documentacion`.

### Se le puede dar acceso a la documentacion

Si.

Una opcion seria convertir parte de la documentacion en una base de conocimiento y hacer que el agente recupere fragmentos relevantes antes de responder.

### Recomendacion

No conviene conectar **todos** los `.md` tal cual.

Motivos:

- muchos documentos contienen errores historicos, decisiones internas y detalles tecnicos que un usuario normal no necesita
- algunas partes pueden quedar desactualizadas
- el asistente podria responder con informacion demasiado tecnica o confusa

La mejor opcion seria preparar una base documental reducida, por ejemplo:

```text
ayuda-usuario.md
faq-usuario.md
funcionalidades.md
```

con solo:

- que hace cada pestaña
- como comprar
- como vender
- como anadir o quitar fondos
- como funciona historial
- que significa cada grafica
- como cambiar tema
- como usar el perfil

### Decision recomendada para la presentacion

Para presentar, se puede dejar como esta si ya responde bien a las dudas previstas.

Como mejora posterior, si quereis que sea mas fiable y explicativo, merece la pena darle acceso a una documentacion **curada para usuarios**, no a toda la documentacion tecnica del proyecto.

