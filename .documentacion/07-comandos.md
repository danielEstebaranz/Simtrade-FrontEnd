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
```

`/panel` esta protegido por el guard. Si no hay sesion, vuelve a `/login`.

## Si no ves cambios

Usa recarga fuerte:

```text
Ctrl + F5
```

Angular suele refrescar solo, pero el navegador puede cachear assets como imagenes o favicon.
