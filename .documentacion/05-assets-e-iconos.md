# Assets, logo e iconos

## Carpeta `public`

Angular sirve los archivos estaticos desde `public`.

Por eso las imagenes que debe cargar el navegador estan aqui:

```text
public/logo_Simtrade.jpeg
public/logo_Simtrade-rounded.png
public/favicon.ico
```

Si una imagen esta en `src/images`, Angular no la sirve automaticamente como archivo publico.

## Error inicial del favicon

El favicon estaba asi:

```html
<link rel="icon" type="image/x-icon" href="src\images\logo_Simtrade.jpeg">
```

Tenia dos problemas:

1. Apuntaba a `src/images`, que no es una carpeta publica del navegador.
2. Usaba barras invertidas `\`, pero en HTML se deben usar barras normales `/`.

## Solucion

Se copio la imagen a `public` y se cambio el enlace a:

```html
<link rel="icon" type="image/png" href="/logo_Simtrade-rounded.png">
```

## Redondear el icono

CSS no puede redondear un favicon de navegador con:

```css
icono {
  border-radius: 10px;
}
```

El favicon no es un elemento visual dentro del DOM de la pagina. Es un recurso que el navegador usa para la pestana.

Por eso se creo una imagen nueva ya redondeada:

```text
public/logo_Simtrade-rounded.png
```

## Logo del sidebar

En el sidebar se usa:

```html
<img
  class="logo"
  ngSrc="/logo_Simtrade-rounded.png"
  width="768"
  height="768"
  alt="Simtrade"
  priority
>
```

Se usa `ngSrc` porque viene de `NgOptimizedImage`, que es la forma recomendada por Angular para imagenes estaticas.

## Error con `<img href>`

En un momento la imagen estaba escrita asi:

```html
<img href="/logo_Simtrade-rounded.png">
```

Eso no funciona porque las imagenes usan `src`, no `href`.

En Angular con `NgOptimizedImage`, la propiedad correcta es `ngSrc`.
