# Documentacion de Simtrade FrontEnd

Esta carpeta recoge una explicacion detallada de la aplicacion, las decisiones tomadas y los problemas que fueron apareciendo durante el desarrollo.

## Documentos

- [01-arquitectura.md](./01-arquitectura.md): estructura general del proyecto Angular.
- [02-componentes.md](./02-componentes.md): componentes creados y responsabilidad de cada uno.
- [03-login-y-backend.md](./03-login-y-backend.md): flujo de login grafico y conexion con el backend.
- [04-rutas-y-navegacion.md](./04-rutas-y-navegacion.md): rutas, guard de autenticacion y enlaces del sidebar.
- [05-assets-e-iconos.md](./05-assets-e-iconos.md): logo, favicon, carpeta `public` e imagen redondeada.
- [06-errores-y-soluciones.md](./06-errores-y-soluciones.md): errores encontrados y como se corrigieron.
- [07-comandos.md](./07-comandos.md): comandos utiles para arrancar y comprobar la aplicacion.
- [08-estructura-del-proyecto.md](./08-estructura-del-proyecto.md): arbol de carpetas y para que sirve cada archivo importante.
- [09-conceptos-angular-usados.md](./09-conceptos-angular-usados.md): conceptos como `router-outlet`, `routerLink`, guards, signals y formularios reactivos.

## Resumen rapido

La aplicacion es un frontend Angular moderno que tiene:

- Una pantalla de login y registro.
- Un servicio de autenticacion que llama al backend.
- Un panel principal protegido por sesion.
- Un sidebar reutilizable con navegacion interna.
- Rutas hijas reales dentro del panel: cartera, mercado, operaciones, alertas, ranking y configuracion.
- Una conexion HTTP con una API Python que reutiliza el backend existente de consola y Firestore.

El backend original funcionaba por consola. Para que el navegador pudiera usarlo, se creo una API HTTP pequena en el repositorio backend, porque un navegador no puede llamar directamente a funciones Python de consola.
