# Comandos utiles

## Instalar dependencias del frontend

```powershell
npm.cmd install
```

Se usa `npm.cmd` en Windows para evitar problemas con `npm.ps1`.

## Compilar frontend

```powershell
npm.cmd run build
```

Sirve para comprobar que Angular compila correctamente.

## Arrancar frontend

```powershell
npm.cmd start -- --host localhost --port 4200
```

URL:

```text
http://localhost:4200/login
```

## Arrancar backend API

Desde el repositorio backend:

```powershell
python api_server.py
```

## Comprobar sintaxis del backend

Desde el repositorio backend:

```powershell
python -m py_compile api_server.py services/db_handler.py
```

Esto no arranca el servidor, solo comprueba que los archivos Python no tengan errores de sintaxis.

URL base:

```text
http://127.0.0.1:8000
```

## Probar endpoint de login sin credenciales reales

```powershell
curl.exe -i -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/json" -d "{\"username\":\"\",\"password\":\"\"}"
```

Debe devolver un error controlado parecido a:

```json
{"message": "Usuario y contrasena son obligatorios."}
```

Eso indica que la API esta viva.

## Probar grafica real de mercado

Con el backend arrancado:

```powershell
curl.exe -s -i "http://127.0.0.1:8000/market/AAPL/trend?range=1d"
```

Debe devolver:

```text
HTTP/1.1 200 OK
```

Y dentro del JSON debe aparecer:

```json
"source": "yfinance"
```

Si devuelve `404`, puede ser que el ticker no tenga historico o que siga arrancado un backend antiguo.

## Probar endpoint protegido de ganancias

Este endpoint necesita un token real recibido al iniciar sesion:

```powershell
curl.exe -s -i "http://127.0.0.1:8000/users/me/portfolio/gains" -H "Authorization: Bearer <idToken>"
```

Sin token debe devolver `401`, y eso es correcto:

```json
{"detail":"Falta cabecera Authorization."}
```

## Probar configuracion del usuario

Hace falta un `idToken` real recibido al iniciar sesion:

```powershell
curl.exe -s -i "http://127.0.0.1:8000/users/me/settings" -H "Authorization: Bearer <idToken>"
```

Para cambiar a modo oscuro:

```powershell
curl.exe -s -i -X PATCH "http://127.0.0.1:8000/users/me/settings" -H "Authorization: Bearer <idToken>" -H "Content-Type: application/json" -d "{\"theme\":\"dark\"}"
```

## Probar anadir fondos

```powershell
curl.exe -s -i -X POST "http://127.0.0.1:8000/users/me/funds" -H "Authorization: Bearer <idToken>" -H "Content-Type: application/json" -d "{\"amount\":250}"
```

Debe devolver `user` actualizado y una operacion con `amount` y `balance`.

## Probar borrado de cuenta

Usar solo con una cuenta de prueba:

```powershell
curl.exe -s -i -X DELETE "http://127.0.0.1:8000/users/me" -H "Authorization: Bearer <idToken>"
```

Debe borrar el usuario de Firebase Authentication, el perfil de Firestore y sus transacciones.

## Ver que proceso usa un puerto

```powershell
netstat -ano | Select-String ":8000"
netstat -ano | Select-String ":4200"
```

Si hay que parar un proceso viejo:

```powershell
Stop-Process -Id <PID> -Force
```

## URLs principales

```text
http://localhost:4200/login
http://localhost:4200/panel/cartera
http://localhost:4200/panel/configuracion
```

`/panel` esta protegido por el guard. Si no hay sesion, vuelve a `/login`.

## Si no ves cambios

Usa recarga fuerte:

```text
Ctrl + F5
```

Angular suele refrescar solo, pero el navegador puede cachear assets como imagenes o favicon.
