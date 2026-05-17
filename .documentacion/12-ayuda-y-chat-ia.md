# Ayuda y chat IA

## Objetivo

La seccion `Ayuda` combina dos niveles de soporte:

1. FAQ desplegable para resolver dudas frecuentes sin salir de la pantalla.
2. Asistente virtual de SIMTRADE para consultas que no aparezcan en las preguntas predefinidas.

La ruta es:

```text
/panel/ayuda
```

El acceso visual no esta en el sidebar. Vive en la cabecera del dashboard, junto al perfil y al boton de cerrar sesion, mediante un boton circular con `?`.

## Archivos implicados

```text
src/app/pages/dashboard/components/ayuda-section/
  ayuda-section.ts
  ayuda-section.html
  ayuda-section.css

src/app/services/chat.ts
```

## FAQ

La FAQ cubre actualmente:

- compra de activos
- venta desde cartera
- anadir fondos
- reinicio de cartera
- historial de operaciones
- cambio entre tema claro y oscuro

Las preguntas se muestran como acordeon accesible usando:

- botones reales
- `aria-expanded`
- `aria-controls`

## Integracion con n8n

El chat del frontend no usa el widget visual de n8n. La interfaz es propia de Angular y llama a un workflow publicado de n8n mediante HTTP:

```text
POST http://localhost:5678/webhook/70182b73-2c1e-49d3-b99c-41aaa164ef52/chat
```

Body enviado:

```json
{
  "chatInput": "Como compro un activo?",
  "sessionId": "simtrade-user-<id>"
}
```

`sessionId` es obligatorio porque el workflow usa `Simple Memory`. Si el usuario ha iniciado sesion, se usa su identificador real. Si no, `ChatService` genera una sesion local persistente.

Respuesta esperada:

```json
{
  "output": "Respuesta del asistente"
}
```

## Workflow de n8n

El flujo actual contiene:

```text
Chat Trigger -> AI Agent
                  |-> OpenAI Chat Model
                  |-> Simple Memory
```

Configuracion relevante:

- chat publico habilitado
- modo `Embedded Chat` / webhook
- CORS permitido para `http://localhost:4200`
- respuesta JSON consumida por Angular

El agente tiene un mensaje de sistema que lo limita al dominio de SIMTRADE. Si recibe una pregunta general ajena al proyecto, responde que solo puede ayudar con cartera, mercado, operaciones, fondos, historial o configuracion.

## Comportamiento de interfaz

El chat:

- abre en modal
- mantiene el compositor visible
- hace autoscroll al ultimo mensaje
- muestra `Escribiendo...` mientras espera respuesta
- muestra error accesible si n8n no responde
- separa visualmente mensajes del usuario y del asistente

Se corrigio un problema donde la respuesta solo aparecia tras volver a enfocar el textarea. La solucion final fue forzar el scroll al final inmediatamente despues de anadir mensajes y actualizar la vista al resolver la respuesta asincrona.

## Alcance funcional

El asistente no esta pensado como un chatbot generalista. Su funcion es:

- explicar el uso de la plataforma
- orientar por las secciones disponibles
- resolver dudas frecuentes del proyecto

No debe responder preguntas generales sin relacion con SIMTRADE.

## Puntos debiles actuales

- La URL de n8n esta hardcodeada en `ChatService`.
- El conocimiento del asistente depende principalmente del prompt y de la FAQ; todavia no consume una base documental propia del proyecto.
- Si n8n no esta levantado en `localhost:5678`, el chat no responde.
- La memoria depende del `sessionId`; si se cambia la logica de sesion, hay que mantenerla alineada con el workflow.

## Mejoras futuras

- mover la URL de n8n a configuracion por entorno
- alimentar al agente con documentacion oficial del proyecto
- registrar consultas frecuentes para ampliar la FAQ
- anadir pruebas automatizadas del flujo de chat
