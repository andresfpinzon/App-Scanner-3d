# 📱 Escáner 3D - App de Control por WiFi (React Native + Expo)

Este proyecto es una aplicación móvil desarrollada con **React Native + Expo (TypeScript)** para controlar un sistema de escaneo 3D basado en **ESP32**, mediante conexión WiFi (HTTP). Toda la lógica del proceso se ejecuta en la app, y el ESP32 solo recibe y ejecuta comandos.

## ⚙️ Requisitos Previos

- [Node.js (≥ 18.x)](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Expo Go (en tu celular Android o iOS)](https://expo.dev/client)

Instalar Expo CLI:
Ejecutar los siguientes comandos en terminal.

```bash
$ npm install -g expo-cli
```
1. En la terminal, crea el proyecto con Expo
expo init escanner-3d-app

2. En el prompt de selección, elige:
❯ blank (TypeScript)

Ingresar al nuevo proyecto:

3. cd escanner-3d-app


Dependencias de navegación:
```bash
$ npm i @react-navigation/native @react-navigation/native-stack @react-navigation/stack react-native-screens react-native-safe-area-context
```

Ejecutar la App

Comando en terminal
```bash
$ npm start
```

Esto abrirá Metro Bundler en la consola.

-Escanear el QR con la app Expo Go desde un celular que tenga la applicacion Expo go.

-Para que los comandos se ejecuten correctamente, se debe estar en la misma red wifi que la tarjeta SP32.

Estructura del Proyecto (MVC)
Se organiza el proyecto en capas siguiendo un modelo MVC simplificado:

```bash

src/
├── controllers/
│   └── EscanerController.ts       # Lógica del escáner y flujo de comandos
├── models/
│   └── EscanerModel.ts            # Estados del escaneo (en desarrollo)
├── services/
│   └── Esp32Service.ts            # Comunicación HTTP con ESP32
├── utils/
│   └── constantes.ts              # Constantes globales (ej. IP del ESP32)
├── views/
│   └── EscanerScreen.tsx          # Pantalla principal
└── AppNavigator.tsx               # Navegación entre pantallas

```
El ESP32 debe actuar como servidor HTTP (modo Access Point o conectado a red WiFi).

Comportamiento esperado:
La app envía comandos vía fetch() a rutas como:

http://192.168.4.1/girar

http://192.168.4.1/subir

http://192.168.4.1/mover?distancia=200

El ESP32 responde con texto plano: "OK" o mensajes de estado.

