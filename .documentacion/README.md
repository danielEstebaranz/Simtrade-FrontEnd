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
- [10-cartera-y-graficas.md](./10-cartera-y-graficas.md): acciones del usuario, grafica real, Chart.js, valor actual, ventas por porcentaje, rangos 1 dia/semana/ano y conexion con mercado.
- [11-librerias-metodologia-y-faq.md](./11-librerias-metodologia-y-faq.md): librerias usadas, metodologia seguida, puntos debiles y preguntas tipicas.

## Resumen rapido

La aplicacion es un frontend Angular moderno que tiene:

- Una pantalla de login y registro.
- Un servicio de autenticacion que llama al backend.
- Un panel principal protegido por sesion.
- Un sidebar reutilizable con navegacion interna.
- Rutas hijas reales dentro del panel: cartera, mercado, historial, estadisticas, configuracion y perfil.
- Compra de acciones desde mercado mediante un popup de importe a invertir.
- Venta de acciones desde cartera mediante porcentajes rapidos o porcentaje personalizado.
- Una conexion HTTP con una API Python que reutiliza el backend existente de consola y Firestore.
- Una vista de cartera con acciones del usuario, nombre legible del activo, valor actual por posicion y grafica de tendencia real usando datos del backend.
- Una vista de estadisticas con mejores y peores rendimientos diarios y semanales de mercado.
- Una vista de perfil separada de configuracion, accesible desde el icono redondo de la cabecera, con resumen de cuenta y grafica de distribucion de cartera.
- Una vista de configuracion conectada al backend para tema claro/oscuro, anadir fondos, quitar fondos, reiniciar cartera y borrar cuenta.
- Tema visual persistente en `localStorage`, sincronizado con `settings.theme` del perfil del usuario.
- Fondo del sidebar distinto en tema claro y oscuro mediante variables CSS e imagenes dedicadas.
- Historial con compras, ventas, depositos, retiradas y reinicios, cada uno con mensaje propio.

El backend original funcionaba por consola. Para que el navegador pudiera usarlo, se creo una API HTTP pequena en el repositorio backend, porque un navegador no puede llamar directamente a funciones Python de consola.
