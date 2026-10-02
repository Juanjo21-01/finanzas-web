# Finanzas Web

Aplicación web del proyecto Finanzas. Está construida con React y Vite y consume la API de Finanzas para mostrar y administrar la información financiera. El navegador se conecta al backend mediante la URL configurada en `VITE_API_URL`.

## Requisitos

- **Node.js:** `20.19` o superior dentro de la rama 20, o `22.12` o superior. Son las versiones admitidas por Vite 8.
- **npm:** `9` o superior, compatible con el formato del archivo `package-lock.json` incluido.
- **API de Finanzas:** debe estar disponible para poder usar las funciones que consultan o modifican datos.

Comprueba las versiones instaladas con:

```bash
node --version
npm --version
```

## Instalación

Desde la raíz del repositorio, instala las dependencias usando el archivo de bloqueo:

```bash
npm ci
```

## Configurar la API

La aplicación necesita `VITE_API_URL` para enviar solicitudes al backend. En la raíz del proyecto, copia `.env.example` a `.env.local` y ajusta la dirección para que coincida con la URL de tu API:

```env
VITE_API_URL=http://localhost:8000/api
```

Por ejemplo, en PowerShell:

```powershell
Copy-Item .env.example .env.local
```

El valor de ejemplo corresponde a una API local en el puerto `8000`. Conserva el prefijo `/api` si las rutas del backend están publicadas bajo ese prefijo. Vite carga las variables `VITE_*` al iniciar el servidor; reinícialo después de cambiar `.env.local`. Para producción, configura `VITE_API_URL` en el entorno del proceso de build antes de compilar. Esta URL queda incluida en los archivos del frontend, por lo que no debe contener secretos.

## Servidor de desarrollo

Con la API levantada y `.env.local` configurado, inicia Vite:

```bash
npm run dev
```

Abre en el navegador la dirección que indique la terminal (por defecto, `http://localhost:5173`). El servidor recarga la página al detectar cambios en el código.

## Build de producción

Genera los archivos optimizados para producción:

```bash
npm run build
```

Vite guarda el resultado en `dist/`. Publica el contenido de esa carpeta en el servicio que aloje el frontend. Define `VITE_API_URL` con la dirección de la API de producción antes de ejecutar el build.

Para revisar localmente el build generado, puedes iniciar el servidor de vista previa:

```bash
npm run preview
```

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera el build de producción en `dist/`. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
