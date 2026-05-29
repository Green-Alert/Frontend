<div align="center">

  <img src="src/assets/GreenAlert - logo principal.png" alt="GreenAlert Logo" width="250" />

  <h1>GreenAlert &mdash; Frontend</h1>

  <p>Plataforma ciudadana de reportes ambientales en tiempo real.<br/>
  Reporta, consulta y visualiza alertas en un mapa interactivo con IA integrada.</p>

  <p>
    <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
    <img src="https://img.shields.io/badge/Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Compose"/>
    <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 20"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18"/>
    <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB 7"/>
    <img src="https://img.shields.io/badge/License-MIT-red?style=flat-square" alt="License MIT"/>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3"/>
    <img src="https://img.shields.io/badge/Vitest-passing-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Tests"/>
    <img src="https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white" alt="ESLint 9"/>
    <img src="https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="CI/CD"/>
  </p>

</div>

---

## Tabla de contenidos

- [Descripcion](#descripcion)
- [Caracteristicas](#caracteristicas)
- [Stack tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Inicio rapido](#inicio-rapido)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalacion local](#instalacion-local)
  - [Con Docker](#con-docker)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas de la aplicacion](#rutas-de-la-aplicacion)
- [Endpoints de la API](#endpoints-de-la-api)
- [Pruebas](#pruebas)
- [Pipeline CI/CD](#pipeline-cicd)
- [Licencia](#licencia)

---

## Descripcion

GreenAlert Frontend es el cliente web de la plataforma **GreenAlert**, una aplicacion ciudadana para reportar y monitorear alertas ambientales. Construido con React 18, Vite 5 y Tailwind CSS, ofrece un mapa interactivo con clusters de reportes, analisis de imagenes por IA, notificaciones push en tiempo real y un sistema de roles con paneles de administracion y moderacion.

---

## Caracteristicas

- **Mapa interactivo** con clusters de marcadores, mapa de calor y zonas de riesgo predictivas (Leaflet)
- **Reportes ambientales** con formulario multi-paso, adjunto de evidencias y analisis por IA
- **Autenticacion completa** -- email/contrasena, OAuth Google/Facebook/GitHub, recuperacion de contrasena
- **Verificacion de email** con codigo OTP
- **Notificaciones push** (Firebase Cloud Messaging) y notificaciones in-app en tiempo real
- **Chatbot conversacional** para asistencia en reportes
- **Dashboard analitico** con graficas de barras, lineas de tiempo y estadisticas de categorias
- **Panel de administracion** -- gestion de usuarios, roles y estados
- **Panel de moderacion** -- revision y gestion de reportes en estado "en revision"
- **Lazy loading** de rutas con `React.lazy` + `Suspense` para bundles optimizados
- **Exportacion de datos** en PDF y CSV
- **Sistema de toast dual-posicion** con notificaciones configurables
- **Tema oscuro** nativo con diseno glassmorphism y animaciones con Motion

---

## Stack tecnologico

| Tecnologia | Version | Rol |
|---|---|---|
| [React](https://react.dev) | 18.3 | UI y gestion de estado con Context API |
| [Vite](https://vitejs.dev) | 5.3 | Bundler, dev server y herramienta de build |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Estilos con design system personalizado |
| [React Router DOM](https://reactrouter.com) | 6.23 | Enrutamiento SPA con HTML5 History API |
| [Axios](https://axios-http.com) | 1.7 | Cliente HTTP con interceptores JWT |
| [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) | 1.9 / 4.2 | Mapas interactivos |
| [react-leaflet-cluster](https://github.com/akursat/react-leaflet-cluster) | 2.1 | Agrupacion de marcadores |
| [Motion](https://motion.dev) | 12 | Animaciones declarativas |
| [lucide-react](https://lucide.dev) | 0.577 | Iconografia SVG |
| [Firebase](https://firebase.google.com) | 12.13 | Cloud Messaging (push notifications) |
| [jsPDF](https://github.com/parallax/jsPDF) | 4.2 | Generacion de reportes PDF |
| [Vitest](https://vitest.dev) | 4.1 | Framework de tests unitarios |
| [Testing Library](https://testing-library.com) | 16 | Utilidades de testing para React |
| [ESLint](https://eslint.org) | 10 | Linting con flat config (ESLint 9+) |

---

## Arquitectura

```
+------------------------------------------------------------------+
|                        Browser / Docker                          |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                   React SPA (puerto 80)                    |  |
|  |                                                            |  |
|  |  AuthContext  -->  JWT en localStorage (ga_token)         |  |
|  |  ToastContext -->  Notificaciones globales                 |  |
|  |  React.lazy  -->  Code splitting por ruta                 |  |
|  |                                                            |  |
|  |  Axios (baseURL: /api) --> Proxy --> Backend :3000        |  |
|  |  Firebase SDK -----------------------------> FCM Push     |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  +--------------+    +----------------+    +--------------+      |
|  |  nginx:1.27  |    |  Backend REST  |    |  MongoDB 7   |      |
|  |  SPA fallback|    |  Node.js :3000 |    |  Atlas/Local |      |
|  +--------------+    +----------------+    +--------------+      |
+------------------------------------------------------------------+
```

En **desarrollo**, Vite actua como proxy transparente hacia el backend:

| Prefijo | Destino | Nota |
|---|---|---|
| `/api/*` | `http://localhost:3000/*` | Elimina el prefijo `/api` |
| `/uploads/*` | `http://localhost:3000/uploads/*` | Archivos estaticos del backend |

En **produccion** (Docker / nginx), el reverse proxy del servidor debe replicar estas reglas.

---

## Inicio rapido

### Prerrequisitos

| Herramienta | Version minima |
|---|---|
| Node.js | 20 LTS |
| npm | 10 |
| Backend GreenAlert | corriendo en `http://localhost:3000` |
| Docker | 24 (solo para despliegue containerizado) |

### Instalacion local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Green-Alert/Frontend.git
cd Frontend

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores reales

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo (http://localhost:5173)
npm run dev
```

### Con Docker

El `Dockerfile` usa una **build multi-stage**: Node.js 20 para compilar y nginx 1.27 para servir la build de produccion. La imagen final pesa ~25 MB.

```bash
# Construir la imagen
docker build -t green-alert-frontend:latest .

# Ejecutar el contenedor (puerto 80 -> 8080 local)
docker run -d \
  --name green-alert-frontend \
  -p 8080:80 \
  --env-file .env.production \
  green-alert-frontend:latest

# Acceder en http://localhost:8080
```

> **Nota:** Las variables `VITE_*` se resuelven en tiempo de **build**, no de ejecucion. Asegurate de pasar el `.env` correcto al ejecutar `docker build`.

---

## Variables de entorno

Copia `.env.example` a `.env.local` para desarrollo o `.env.production` para produccion:

| Variable | Descripcion | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:3000` |
| `VITE_APP_NAME` | Nombre de la aplicacion | `GreenAlert` |
| `VITE_APP_VERSION` | Version del build | `2.0.0` |
| `VITE_ENV` | Entorno activo | `development` / `production` |
| `VITE_ENABLE_MAPS` | Activar modulo de mapas | `true` |
| `VITE_ENABLE_NOTIFICATIONS` | Activar notificaciones push | `true` |
| `VITE_ENABLE_IA_FEATURES` | Activar funciones de IA | `false` |
| `VITE_FIREBASE_API_KEY` | API Key de Firebase | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain de Firebase | `green-alert-1.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID de Firebase | `green-alert-1` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID FCM | `141245905908` |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase | `1:141...` |
| `VITE_FIREBASE_VAPID_KEY` | VAPID Key para push | `BD3e67...` |

---

## Scripts disponibles

| Script | Descripcion |
|---|---|
| `npm run dev` | Inicia Vite en modo desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Genera el bundle optimizado en `dist/` con code splitting |
| `npm run preview` | Sirve el contenido de `dist/` localmente |
| `npm run lint` | Analiza `src/` con ESLint 9 (flat config) |
| `npm run test` | Ejecuta los tests con Vitest (modo `run`, sin watch) |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura (umbral minimo: 70%) |

---

## Estructura del proyecto

```
Frontend/
+-- Dockerfile                     # Build multi-stage: Node.js 20 + nginx 1.27
+-- .env.example                   # Plantilla de variables de entorno
+-- .npmrc                         # legacy-peer-deps=true para CI/CD
+-- eslint.config.js               # ESLint 9 flat config
+-- vite.config.js                 # Vite + Vitest config con code splitting
+-- tailwind.config.js
+-- postcss.config.js
+-- package.json
|
+-- .github/
|   +-- workflows/
|       +-- CiFrontend.yml         # Pipeline CI/CD: lint -> test -> build -> deploy
|
+-- public/                        # Assets estaticos (servidos sin procesamiento)
|
+-- src/
    +-- App.jsx                    # Arbol de rutas con React.lazy y providers globales
    +-- main.jsx                   # Punto de entrada -- monta <App />
    +-- index.css                  # Estilos globales y utilidades Tailwind custom
    |
    +-- assets/                    # Imagenes e iconos importados en codigo
    |
    +-- components/                # Componentes reutilizables
    |   +-- AvatarCropperModal.jsx # Recorte de avatar con react-easy-crop
    |   +-- DescargarDatos.jsx     # Exportacion de datos a PDF/CSV
    |   +-- FormSection.jsx        # Seccion de formulario con titulo e icono
    |   +-- FormularioReporte.jsx  # Formulario multi-paso de nuevo reporte
    |   +-- Layout.jsx             # Shell con Navbar + <Outlet>
    |   +-- LikeButton.jsx         # Boton de like con animacion
    |   +-- LocationPicker.jsx     # Selector de ubicacion en mapa (Leaflet)
    |   +-- MediaLightbox.jsx      # Visor de imagenes/videos a pantalla completa
    |   +-- Navbar.jsx             # Barra de navegacion con dropdown de usuario y avatar
    |   +-- NebulaBackground.jsx   # Fondo animado de particulas para pantallas auth
    |   +-- PasswordStrengthIndicator.jsx  # Indicador de fortaleza de contrasena (5 criterios)
    |   +-- ProtectedRoute.jsx     # Redirige a /login si no hay sesion o rol insuficiente
    |   +-- ReportsMap.jsx         # Mapa con clusters y mapa de calor de reportes
    |   +-- ToastContainer.jsx     # Renderiza notificaciones toast activas
    |   +-- VerificacionEmailBanner.jsx    # Banner de verificacion de email pendiente
    |   +-- charts/
    |       +-- BarChart.jsx       # Grafico de barras (estadisticas por categoria)
    |       +-- LineChart.jsx      # Grafico de lineas (evolucion temporal)
    |
    +-- constants/
    |   +-- categorias.js          # Catalogo de categorias de riesgo con colores e iconos
    |
    +-- context/
    |   +-- AuthContext.jsx        # Estado de sesion: login, logout, register, updateUser
    |   +-- ToastContext.jsx       # Sistema de notificaciones toast global
    |
    +-- pages/
    |   +-- About.jsx              # Informacion del proyecto (publica)
    |   +-- AdminPanel.jsx         # Panel de administracion -- estadisticas y gestion
    |   +-- AdminUsuarios.jsx      # Gestion de usuarios (solo admin)
    |   +-- Auth.jsx               # Login y registro unificados con OAuth
    |   +-- Dashboard.jsx          # Panel con estadisticas y mapa resumen
    |   +-- FacebookCallback.jsx   # Callback OAuth Facebook
    |   +-- ForgotPassword.jsx     # Solicitud de restablecimiento de contrasena
    |   +-- GitHubCallback.jsx     # Callback OAuth GitHub
    |   +-- Home.jsx               # Landing page publica
    |   +-- Login.jsx              # Inicio de sesion (legado, alias de Auth)
    |   +-- Moderacion.jsx         # Panel de moderacion de reportes en revision
    |   +-- NewReport.jsx          # Crear nuevo reporte con analisis IA
    |   +-- NotFound.jsx           # Pagina 404
    |   +-- PoliticaPrivacidad.jsx # Politica de privacidad
    |   +-- Profile.jsx            # Perfil del usuario autenticado
    |   +-- Register.jsx           # Registro de cuenta (legado, alias de Auth)
    |   +-- ReportDetail.jsx       # Detalle de reporte con evidencias, likes y mapa
    |   +-- Reports.jsx            # Listado, filtrado y tendencias semanales
    |   +-- ResetPassword.jsx      # Restablecer contrasena con token
    |   +-- Settings.jsx           # Configuracion de cuenta y notificaciones
    |   +-- TerminosCondiciones.jsx # Terminos y condiciones de uso
    |   +-- Trending.jsx           # Reportes trending con grid de destacados
    |   +-- VerificarEmail.jsx     # Verificacion de email con codigo OTP
    |
    +-- services/
    |   +-- api.js                 # Instancia Axios + interceptores JWT (baseURL: /api)
    |
    +-- test/
    |   +-- setup.js               # Setup global de Vitest (@testing-library/jest-dom)
    |
    +-- utils/
        +-- animations.jsx         # Componentes Reveal y CountUp reutilizables
        +-- geo.js                 # Utilidades de geolocalizacion
        +-- reportesPdf.js         # Generacion de PDFs con jsPDF + autotable
```

---

## Rutas de la aplicacion

### Publicas

| Ruta | Componente | Descripcion |
|---|---|---|
| `/` | `Home` | Landing page; redirige a `/dashboard` si hay sesion activa |
| `/reports` | `Reports` | Listado de reportes con filtros y tendencias semanales |
| `/reports/:id` | `ReportDetail` | Detalle, evidencias, likes y mapa del reporte |
| `/trending` | `Trending` | Reportes mas destacados (grid de trending) |
| `/privacidad` | `PoliticaPrivacidad` | Politica de privacidad |
| `/terminos` | `TerminosCondiciones` | Terminos y condiciones |

### Autenticacion (sin Layout)

| Ruta | Componente | Descripcion |
|---|---|---|
| `/login` | `Auth` | Inicio de sesion con email o OAuth |
| `/register` | `Auth` | Registro de cuenta nueva |
| `/forgot-password` | `ForgotPassword` | Solicitar enlace de restablecimiento |
| `/reset-password` | `ResetPassword` | Restablecer contrasena con token |
| `/auth/callback/facebook` | `FacebookCallback` | Callback OAuth Facebook |

### Protegidas -- cualquier usuario autenticado

| Ruta | Componente | Descripcion |
|---|---|---|
| `/verificar-email` | `VerificarEmail` | Verificacion de email con OTP |
| `/dashboard` | `Dashboard` | Estadisticas generales y mapa resumen |
| `/reports/new` | `NewReport` | Crear nuevo reporte con analisis por IA |
| `/nuevo-reporte` | `FormularioReporte` | Formulario multi-paso alternativo |
| `/profile` | `Profile` | Perfil y avatar del usuario |
| `/settings` | `Settings` | Configuracion de cuenta y notificaciones |

### Protegidas -- moderador y admin

| Ruta | Componente | Descripcion |
|---|---|---|
| `/moderacion` | `Moderacion` | Revision y gestion de reportes en estado "en revision" |

### Protegidas -- solo admin

| Ruta | Componente | Descripcion |
|---|---|---|
| `/admin` | `AdminPanel` | Panel de administracion con metricas |
| `/admin/usuarios` | `AdminUsuarios` | Gestion de usuarios: roles, estados, baja |

### 404

| Ruta | Componente |
|---|---|
| `*` | `NotFound` |

---

## Endpoints de la API

Todas las peticiones se realizan desde `services/api.js` con `baseURL: /api`. El proxy de Vite (desarrollo) y el reverse proxy del servidor (produccion) redirigen `/api/*` al backend en `http://localhost:3000`.

### Autenticacion

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesion con email y contrasena |
| `POST` | `/auth/register` | Registrar cuenta nueva |
| `POST` | `/auth/google` | OAuth con token de acceso Google |
| `POST` | `/auth/facebook` | OAuth con codigo de Facebook |
| `GET` | `/auth/perfil` | Obtener datos del usuario autenticado |
| `PATCH` | `/auth/perfil` | Actualizar nombre, apellido, telefono |
| `PATCH` | `/auth/avatar` | Subir y actualizar foto de perfil |
| `PATCH` | `/auth/cambiar-contrasena` | Cambiar contrasena actual |
| `PATCH` | `/auth/notificaciones` | Actualizar preferencias de notificaciones |
| `POST` | `/auth/forgot-password` | Solicitar enlace de restablecimiento |
| `POST` | `/auth/reset-password` | Restablecer contrasena con token |
| `POST` | `/auth/enviar-verificacion` | Enviar codigo OTP al email |
| `POST` | `/auth/verificar-email` | Verificar email con codigo OTP |

### Categorias

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/categorias` | Listar todas las categorias de riesgo |
| `GET` | `/categorias/:codigo` | Obtener categoria por codigo |

### Reportes

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `POST` | `/reportes` | Crear nuevo reporte (multipart con evidencias) |
| `GET` | `/reportes` | Listar reportes con filtros y paginacion |
| `GET` | `/reportes/:id` | Obtener detalle de un reporte |
| `PATCH` | `/reportes/:id` | Actualizar reporte |
| `DELETE` | `/reportes/:id` | Eliminar reporte |
| `GET` | `/reportes/mis-reportes` | Reportes del usuario autenticado |
| `GET` | `/reportes/export` | Exportar reportes (CSV/JSON) |
| `POST` | `/reportes/:id/like` | Dar o quitar like a un reporte |
| `GET` | `/reportes/trending` | Reportes con mas likes (ultima semana) |

### Reportes -- Estadisticas

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/reportes/stats` | Totales generales (contador, por estado) |
| `GET` | `/reportes/stats/categoria` | Distribucion por categoria |
| `GET` | `/reportes/stats/timeline` | Evolucion temporal de reportes |
| `GET` | `/reportes/stats/heatmap` | Puntos georreferenciados para mapa de calor |
| `GET` | `/reportes/stats/ia` | Agregados de analisis IA para graficos |

### Reportes -- Inteligencia Artificial

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `POST` | `/reportes/analizar-imagen` | Clasificar imagen antes de crear el reporte |
| `POST` | `/reportes/sugerir-contenido` | Sugerir titulo y descripcion desde imagenes |
| `GET` | `/reportes/zonas-riesgo` | Zonas de riesgo predictivas georreferenciadas |
| `GET` | `/reportes/alertas-predictivas` | Alertas predictivas por zona |

### Chatbot

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `POST` | `/chatbot/mensaje` | Enviar mensaje al chatbot conversacional |
| `GET` | `/chatbot/faqs` | Obtener preguntas frecuentes |

### Notificaciones

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/notificaciones` | Listar notificaciones in-app |
| `GET` | `/notificaciones/contador` | Conteo de notificaciones no leidas |
| `PATCH` | `/notificaciones/:uuid/leida` | Marcar notificacion como leida |
| `PATCH` | `/notificaciones/marcar-todas` | Marcar todas como leidas |
| `DELETE` | `/notificaciones/:uuid` | Eliminar notificacion |
| `POST` | `/notificaciones/fcm-token` | Registrar token FCM para push notifications |

### Administracion (solo admin)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| `GET` | `/admin/usuarios/stats` | Metricas de usuarios registrados |
| `GET` | `/admin/usuarios` | Listar usuarios con paginacion y filtros |
| `GET` | `/admin/usuarios/:id` | Detalle de un usuario |
| `PATCH` | `/admin/usuarios/:id/rol` | Cambiar rol (`usuario`, `moderador`, `admin`) |
| `PATCH` | `/admin/usuarios/:id/estado` | Activar o desactivar cuenta |
| `DELETE` | `/admin/usuarios/:id` | Eliminar usuario permanentemente |

---

## Pruebas

El proyecto usa **Vitest** + **Testing Library** con `jsdom` como entorno de DOM.

```bash
# Ejecutar todos los tests (una sola pasada)
npm run test

# Ejecutar con reporte de cobertura
npm run test:coverage
```

### Suites de tests

| Archivo | Tests | Descripcion |
|---|---|---|
| `src/components/FormSection.test.jsx` | 6 | Renderizado, icono, variantes danger/normal, children |
| `src/components/ProtectedRoute.test.jsx` | 5 | Spinner de carga, redireccion a /login, roles |
| `src/pages/Auth.test.jsx` | 6 | Pantalla de autenticacion, campos, OAuth |

**Cobertura minima requerida:** 70% en lineas, funciones, ramas y sentencias.

---

## Pipeline CI/CD

Definido en `.github/workflows/CiFrontend.yml`. Se ejecuta en cada `push` y `pull_request` a `main`.

```
push / PR a main
        |
        v
   +---------+
   |  lint   |  ESLint 9 -- analiza src/
   +----+----+
        | pasa
        v
   +---------+
   |  test   |  Vitest -- 17+ tests unitarios
   +----+----+
        | pasa
        v
   +---------+
   |  build  |  Vite -- genera dist/ y sube artefacto
   +----+----+
        | solo push a main
        v
   +---------+
   | deploy  |  peaceiris/actions-gh-pages -> GitHub Pages
   +---------+
```

| Job | Necesita | Condicion |
|---|---|---|
| `lint` | -- | siempre |
| `test` | `lint` | siempre |
| `build` | `test` | siempre |
| `deploy` | `build` | solo `push` a `main` |

---

## Licencia

Este proyecto esta bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para mas informacion.
