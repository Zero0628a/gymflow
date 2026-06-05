# GymFlow

Aplicación móvil para gestión de entrenamientos, construida con [Expo](https://expo.dev) (React Native) y Firebase.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)
- App [Expo Go](https://expo.dev/go) en tu teléfono, o un emulador de Android / simulador de iOS

## Instalación

1. Clona el repositorio y entra en la carpeta:

   ```bash
   git clone <url-del-repositorio>
   cd gymflow
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

> La configuración de Firebase ya está incluida en [lib/firebase.ts](lib/firebase.ts), no necesitas crear archivos de entorno.

## Inicialización

Inicia el servidor de desarrollo:

```bash
npm start
```

En la salida verás un código QR y opciones para abrir la app:

- **Expo Go**: escanea el código QR con tu teléfono
- **Android**: presiona `a` para abrir en emulador
- **iOS**: presiona `i` para abrir en simulador
- **Web**: presiona `w` para abrir en el navegador

### Otros comandos

```bash
npm run android   # Compila y abre en Android
npm run ios       # Compila y abre en iOS
npm run web       # Inicia en el navegador
npm run lint      # Revisa el código con ESLint
```

## Estructura del proyecto

El código de las pantallas vive en el directorio `app/`, que usa [enrutado por archivos](https://docs.expo.dev/router/introduction) de Expo Router.
