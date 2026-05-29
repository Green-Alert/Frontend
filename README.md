<div align="center">

  <img src="public/logo.png" alt="GreenAlert Logo" width="80" />

  <h1>GreenAlert â€” Frontend</h1>

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

- [DescripciÃ³n](#descripciÃ³n)
- [CaracterÃ­sticas](#caracterÃ­sticas)
- [Stack tecnolÃ³gico](#stack-tecnolÃ³gico)
- [Arquitectura](#arquitectura)
- [Inicio rÃ¡pido](#inicio-rÃ¡pido)
  - [Prerrequisitos](#prerrequisitos)
  - [InstalaciÃ³n local](#instalaciÃ³n-local)
  - [Con Docker](#con-docker)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas de la aplicaciÃ³n](#rutas-de-la-aplicaciÃ³n)
- [Endpoints de la API](#endpoints-de-la-api)
- [Pruebas](#pruebas)
- [Pipeline CI/CD](#pipeline-cicd)
- [Licencia](#licencia)

---

## DescripciÃ³n

GreenAlert Frontend es el cliente web de la plataforma **GreenAlert**, una aplicaciÃ³n ciudadana para reportar y monitorear alertas ambientales. Construido con React 18, Vite 5 y Tailwind CSS, ofrece un mapa interactivo con clÃºsteres de reportes, anÃ¡lisis de imÃ¡genes por IA, notificaciones push en tiempo real y un sistema de roles con paneles de administraciÃ³n y moderaciÃ³n.

---

## CaracterÃ­sticas

- **Mapa interactivo** con clÃºsteres de marcadores, mapa de calor y zonas de riesgo predictivas (Leaflet)
- **Reportes ambientales** con formulario multi-paso, adjunto de evidencias y anÃ¡lisis por IA
- **AutenticaciÃ³n completa** â€” email/contraseÃ±a, OAuth Google/Facebook/GitHub, recuperaciÃ³n de contraseÃ±a
- **VerificaciÃ³n de email** con cÃ³digo OTP
- **Notificaciones push** (Firebase Cloud Messaging) y notificaciones in-app en tiempo real
- **Chatbot conversacional** para asistencia en reportes
- **Dashboard analÃ­tico** con grÃ¡ficas de barras, lÃ­neas de tiempo y estadÃ­sticas de categorÃ­as
- **Panel de administraciÃ³n** â€” gestiÃ³n de usuarios, roles y estados
- **Panel de moderaciÃ³n** â€” revisiÃ³n y gestiÃ³n de reportes en estado "en revisiÃ³n"
- **Lazy loading** de rutas con `React.lazy` + `Suspense` para bundles optimizados
- **ExportaciÃ³n de datos** en PDF y CSV
- **Sistema de toast dual-posiciÃ³n** con notificaciones configurables
- **Tema oscuro** nativo con diseÃ±o glassmorphism y animaciones con Motion

---

## Stack tecnolÃ³gico

| TecnologÃ­a | VersiÃ³n | Rol |
|---|---|---|
| [React](https://react.dev) | 18.3 | UI y gestiÃ³n de estado con Context API |
| [Vite](https://vitejs.dev) | 5.3 | Bundler, dev server y herramienta de build |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Estilos con design system personalizado |
| [React Router DOM](https://reactrouter.com) | 6.23 | Enrutamiento SPA con HTML5 History API |
| [Axios](https://axios-http.com) | 1.7 | Cliente HTTP con interceptores JWT |
| [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) | 1.9 / 4.2 | Mapas interactivos |
| [react-leaflet-cluster](https://github.com/akursat/react-leaflet-cluster) | 2.1 | AgrupaciÃ³n de marcadores |
| [Motion](https://motion.dev) | 12 | Animaciones declarativas |
| [lucide-react](https://lucide.dev) | 0.577 | IconografÃ­a SVG |
| [Firebase](https://firebase.google.com) | 12.13 | Cloud Messaging (push notifications) |
| [jsPDF](https://github.com/parallax/jsPDF) | 4.2 | GeneraciÃ³n de reportes PDF |
| [Vitest](https://vitest.dev) | 4.1 | Framework de tests unitarios |
| [Testing Library](https://testing-library.com) | 16 | Utilidades de testing para React |
| [ESLint](https://eslint.org) | 10 | Linting con flat config (ESLint 9+) |

---

## Arquitectura

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        Browser / Docker                         â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                   React SPA (puerto 80)                  â”‚   â”‚
â”‚  â”‚                                                          â”‚   â”‚
â”‚  â”‚  AuthContext â”€â”€â–º JWT en localStorage (ga_token)         â”‚   â”‚
â”‚  â”‚  ToastContext â”€â”€â–º Notificaciones globales                â”‚   â”‚
â”‚  â”‚  React.lazy â”€â”€â–º Code splitting por ruta                 â”‚   â”‚
â”‚  â”‚                                                          â”‚   â”‚
â”‚  â”‚  Axios (baseURL: /api) â”€â”€â–º Proxy â”€â”€â–º Backend :3000      â”‚   â”‚
â”‚  â”‚  Firebase SDK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º FCM Push          â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  nginx:1.27   â”‚    â”‚  Backend REST   â”‚   â”‚  MongoDB 7    â”‚   â”‚
â”‚  â”‚  SPA fallback â”‚    â”‚  Node.js :3000  â”‚   â”‚  Atlas / Localâ”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

En **desarrollo**, Vite actÃºa como proxy transparente hacia el backend:

| Prefijo | Destino | Nota |
|---|---|---|
| `/api/*` | `http://localhost:3000/*` | Elimina el prefijo `/api` |
| `/uploads/*` | `http://localhost:3000/uploads/*` | Archivos estÃ¡ticos del backend |

En **producciÃ³n** (Docker / nginx), el reverse proxy del servidor web debe replicar estas reglas.

---

## Inicio rÃ¡pido

### Prerrequisitos

| Herramienta | VersiÃ³n mÃ­nima |
|---|---|
| Node.js | 20 LTS |
| npm | 10 |
| Backend GreenAlert | corriendo en `http://localhost:3000` |
| Docker | 24 (solo para despliegue containerizado) |

### InstalaciÃ³n local

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

El `Dockerfile` usa una **build multi-stage**: Node.js 20 para compilar y nginx 1.27 para servir la build de producciÃ³n. La imagen final pesa ~25 MB.

```bash
# Construir la imagen
docker build -t green-alert-frontend:latest .

# Ejecutar el contenedor (puerto 80 â†’ 8080 local)
docker run -d \
  --name green-alert-frontend \
  -p 8080:80 \
  --env-file .env.production \
  green-alert-frontend:latest

# Acceder en http://localhost:8080
```

> **Nota:** Las variables `VITE_*` se resuelven en tiempo de **build**, no de ejecuciÃ³n. AsegÃºrate de que el `--env-file` se pase durante `docker build` si usas secrets distintos por entorno.

---

## Variables de entorno

Copia `.env.example` a `.env.local` para desarrollo o `.env.production` para producciÃ³n y completa los valores:

| Variable | DescripciÃ³n | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:3000` |
| `VITE_APP_NAME` | Nombre de la aplicaciÃ³n | `GreenAlert` |
| `VITE_APP_VERSION` | VersiÃ³n del build | `2.0.0` |
| `VITE_ENV` | Entorno activo | `development` / `production` |
| `VITE_ENABLE_MAPS` | Activar mÃ³dulo de mapas | `true` |
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

| Script | DescripciÃ³n |
|---|---|
| `npm run dev` | Inicia Vite en modo desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Genera el bundle optimizado en `dist/` con code splitting |
| `npm run preview` | Sirve el contenido de `dist/` localmente |
| `npm run lint` | Analiza `src/` con ESLint 9 (flat config) |
| `npm run test` | Ejecuta los tests con Vitest (modo `run`, sin watch) |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura (umbral mÃ­nimo: 70%) |

---

## Estructura del proyecto

```
Frontend/
â”œâ”€â”€ Dockerfile                     # Build multi-stage: Node.js 20 + nginx 1.27
â”œâ”€â”€ .env.example                   # Plantilla de variables de entorno
â”œâ”€â”€ .npmrc                         # legacy-peer-deps=true para CI/CD
â”œâ”€â”€ eslint.config.js               # ESLint 9 flat config
â”œâ”€â”€ vite.config.js                 # Vite + Vitest config con code splitting
â”œâ”€â”€ tailwind.config.js
â”œâ”€â”€ postcss.config.js
â”œâ”€â”€ package.json
â”‚
â”œâ”€â”€ .github/
â”‚   â””â”€â”€ workflows/
â”‚       â””â”€â”€ CiFrontend.yml         # Pipeline CI/CD: lint â†’ test â†’ build â†’ deploy
â”‚
â”œâ”€â”€ public/                        # Assets estÃ¡ticos (servidos sin procesamiento)
â”‚
â””â”€â”€ src/
    â”œâ”€â”€ App.jsx                    # Ãrbol de rutas con React.lazy y providers globales
    â”œâ”€â”€ main.jsx                   # Punto de entrada â€” monta <App />
    â”œâ”€â”€ index.css                  # Estilos globales y utilidades Tailwind custom
    â”‚
    â”œâ”€â”€ assets/                    # ImÃ¡genes e Ã­conos importados en cÃ³digo
    â”‚
    â”œâ”€â”€ components/                # Componentes reutilizables
    â”‚   â”œâ”€â”€ AvatarCropperModal.jsx # Recorte de avatar con react-easy-crop
    â”‚   â”œâ”€â”€ DescargarDatos.jsx     # ExportaciÃ³n de datos a PDF/CSV
    â”‚   â”œâ”€â”€ FormSection.jsx        # SecciÃ³n de formulario con tÃ­tulo e Ã­cono
    â”‚   â”œâ”€â”€ FormularioReporte.jsx  # Formulario multi-paso de nuevo reporte
    â”‚   â”œâ”€â”€ Layout.jsx             # Shell con Navbar + <Outlet>
    â”‚   â”œâ”€â”€ LikeButton.jsx         # BotÃ³n de like con animaciÃ³n
    â”‚   â”œâ”€â”€ LocationPicker.jsx     # Selector de ubicaciÃ³n en mapa (Leaflet)
    â”‚   â”œâ”€â”€ MediaLightbox.jsx      # Visor de imÃ¡genes/vÃ­deos a pantalla completa
    â”‚   â”œâ”€â”€ Navbar.jsx             # Barra de navegaciÃ³n con dropdown de usuario y avatar
    â”‚   â”œâ”€â”€ NebulaBackground.jsx   # Fondo animado de partÃ­culas para pantallas auth
    â”‚   â”œâ”€â”€ PasswordStrengthIndicator.jsx  # Indicador de fortaleza de contraseÃ±a (5 criterios)
    â”‚   â”œâ”€â”€ ProtectedRoute.jsx     # Redirige a /login si no hay sesiÃ³n o rol insuficiente
    â”‚   â”œâ”€â”€ ReportsMap.jsx         # Mapa con clÃºsteres y mapa de calor de reportes
    â”‚   â”œâ”€â”€ ToastContainer.jsx     # Renderiza notificaciones toast activas
    â”‚   â”œâ”€â”€ VerificacionEmailBanner.jsx    # Banner de verificaciÃ³n de email pendiente
    â”‚   â””â”€â”€ charts/
    â”‚       â”œâ”€â”€ BarChart.jsx       # GrÃ¡fico de barras (estadÃ­sticas por categorÃ­a)
    â”‚       â””â”€â”€ LineChart.jsx      # GrÃ¡fico de lÃ­neas (evoluciÃ³n temporal)
    â”‚
    â”œâ”€â”€ constants/
    â”‚   â””â”€â”€ categorias.js          # CatÃ¡logo de categorÃ­as de riesgo con colores e Ã­conos
    â”‚
    â”œâ”€â”€ context/
    â”‚   â”œâ”€â”€ AuthContext.jsx        # Estado de sesiÃ³n: login, logout, register, updateUser
    â”‚   â””â”€â”€ ToastContext.jsx       # Sistema de notificaciones toast global
    â”‚
    â”œâ”€â”€ pages/
    â”‚   â”œâ”€â”€ About.jsx              # InformaciÃ³n del proyecto (pÃºblica)
    â”‚   â”œâ”€â”€ AdminPanel.jsx         # Panel de administraciÃ³n â€” estadÃ­sticas y gestiÃ³n
    â”‚   â”œâ”€â”€ AdminUsuarios.jsx      # GestiÃ³n de usuarios (solo admin)
    â”‚   â”œâ”€â”€ Auth.jsx               # Login y registro unificados con OAuth
    â”‚   â”œâ”€â”€ Dashboard.jsx          # Panel con estadÃ­sticas y mapa resumen
    â”‚   â”œâ”€â”€ FacebookCallback.jsx   # Callback OAuth Facebook
    â”‚   â”œâ”€â”€ ForgotPassword.jsx     # Solicitud de restablecimiento de contraseÃ±a
    â”‚   â”œâ”€â”€ GitHubCallback.jsx     # Callback OAuth GitHub
    â”‚   â”œâ”€â”€ Home.jsx               # Landing page pÃºblica
    â”‚   â”œâ”€â”€ Login.jsx              # Inicio de sesiÃ³n (legado, alias de Auth)
    â”‚   â”œâ”€â”€ Moderacion.jsx         # Panel de moderaciÃ³n de reportes en revisiÃ³n
    â”‚   â”œâ”€â”€ NewReport.jsx          # Crear nuevo reporte con anÃ¡lisis IA
    â”‚   â”œâ”€â”€ NotFound.jsx           # PÃ¡gina 404
    â”‚   â”œâ”€â”€ PoliticaPrivacidad.jsx # PolÃ­tica de privacidad
    â”‚   â”œâ”€â”€ Profile.jsx            # Perfil del usuario autenticado
    â”‚   â”œâ”€â”€ Register.jsx           # Registro de cuenta (legado, alias de Auth)
    â”‚   â”œâ”€â”€ ReportDetail.jsx       # Detalle de reporte con evidencias, likes y mapa
    â”‚   â”œâ”€â”€ Reports.jsx            # Listado, filtrado y tendencias semanales
    â”‚   â”œâ”€â”€ ResetPassword.jsx      # Restablecer contraseÃ±a con token
    â”‚   â”œâ”€â”€ Settings.jsx           # ConfiguraciÃ³n de cuenta y notificaciones
    â”‚   â”œâ”€â”€ TerminosCondiciones.jsx # TÃ©rminos y condiciones de uso
    â”‚   â”œâ”€â”€ Trending.jsx           # Reportes trending con grid de destacados
    â”‚   â””â”€â”€ VerificarEmail.jsx     # VerificaciÃ³n de email con cÃ³digo OTP
    â”‚
    â”œâ”€â”€ services/
    â”‚   â””â”€â”€ api.js                 # Instancia Axios + interceptores JWT (baseURL: /api)
    â”‚
    â”œâ”€â”€ test/
    â”‚   â””â”€â”€ setup.js               # Setup global de Vitest (@testing-library/jest-dom)
    â”‚
    â””â”€â”€ utils/
        â”œâ”€â”€ animations.jsx         # Componentes Reveal y CountUp reutilizables
        â”œâ”€â”€ geo.js                 # Utilidades de geolocalizaciÃ³n
        â””â”€â”€ reportesPdf.js         # GeneraciÃ³n de PDFs con jsPDF + autotable
```

---

## Rutas de la aplicaciÃ³n

### PÃºblicas

| Ruta | Componente | DescripciÃ³n |
|---|---|---|
| `/` | `Home` | Landing page; redirige a `/dashboard` si hay sesiÃ³n activa |
| `/reports` | `Reports` | Listado de reportes con filtros y tendencias semanales |
| `/reports/:id` | `ReportDetail` | Detalle, evidencias, likes y mapa del reporte |
| `/trending` | `Trending` | Reportes mÃ¡s destacados (grid de trending) |
| `/privacidad` | `PoliticaPrivacidad` | PolÃ­tica de privacidad |
| `/terminos` | `TerminosCondiciones` | TÃ©rminos y condiciones |

### AutenticaciÃ³n (sin Layout)

| Ruta | Componente | DescripciÃ³n |
|---|---|---|
| `/login` | `Auth` | Inicio de sesiÃ³n con email o OAuth |
| `/register` | `Auth` | Registro de cuenta nueva |
| `/forgot-password` | `ForgotPassword` | Solicitar enlace de restablecimiento |
| `/reset-password` | `ResetPassword` | Restablecer contraseÃ±a con token |
| `/auth/callback/facebook` | `FacebookCallback` | Callback OAuth Facebook |

### Protegidas â€” cualquier usuario autenticado

| Ruta | Componente | DescripciÃ³n |
|---|---|---|
| `/verificar-email` | `VerificarEmail` | VerificaciÃ³n de email con OTP |
| `/dashboard` | `Dashboard` | EstadÃ­sticas generales y mapa resumen |
| `/reports/new` | `NewReport` | Crear nuevo reporte con anÃ¡lisis por IA |
| `/nuevo-reporte` | `FormularioReporte` | Formulario multi-paso alternativo |
| `/profile` | `Profile` | Perfil y avatar del usuario |
| `/settings` | `Settings` | ConfiguraciÃ³n de cuenta y notificaciones |

### Protegidas â€” moderador y admin

| Ruta | Componente | DescripciÃ³n |
|---|---|---|
| `/moderacion` | `Moderacion` | RevisiÃ³n y gestiÃ³n de reportes en estado "en revisiÃ³n" |

### Protegidas â€” solo admin

| Ruta | Componente | DescripciÃ³n |
|---|---|---|
| `/admin` | `AdminPanel` | Panel de administraciÃ³n con mÃ©tricas |
| `/admin/usuarios` | `AdminUsuarios` | GestiÃ³n de usuarios: roles, estados, baja |

### 404

| Ruta | Componente |
|---|---|
| `*` | `NotFound` |

---

## Endpoints de la API

Todas las peticiones se realizan desde `services/api.js` con `baseURL: /api`. El proxy de Vite (desarrollo) y el reverse proxy del servidor (producciÃ³n) redirigen `/api/*` al backend en `http://localhost:3000`.

### AutenticaciÃ³n

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesiÃ³n con email y contraseÃ±a |
| `POST` | `/auth/register` | Registrar cuenta nueva |
| `POST` | `/auth/google` | OAuth con token de acceso Google |
| `POST` | `/auth/facebook` | OAuth con cÃ³digo de Facebook |
| `GET` | `/auth/perfil` | Obtener datos del usuario autenticado |
| `PATCH` | `/auth/perfil` | Actualizar nombre, apellido, telÃ©fono |
| `PATCH` | `/auth/avatar` | Subir y actualizar foto de perfil |
| `PATCH` | `/auth/cambiar-contrasena` | Cambiar contraseÃ±a actual |
| `PATCH` | `/auth/notificaciones` | Actualizar preferencias de notificaciones |
| `POST` | `/auth/forgot-password` | Solicitar enlace de restablecimiento |
| `POST` | `/auth/reset-password` | Restablecer contraseÃ±a con token |
| `POST` | `/auth/enviar-verificacion` | Enviar cÃ³digo OTP al email |
| `POST` | `/auth/verificar-email` | Verificar email con cÃ³digo OTP |

### CategorÃ­as

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `GET` | `/categorias` | Listar todas las categorÃ­as de riesgo |
| `GET` | `/categorias/:codigo` | Obtener categorÃ­a por cÃ³digo |

### Reportes

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `POST` | `/reportes` | Crear nuevo reporte (multipart con evidencias) |
| `GET` | `/reportes` | Listar reportes con filtros y paginaciÃ³n |
| `GET` | `/reportes/:id` | Obtener detalle de un reporte |
| `PATCH` | `/reportes/:id` | Actualizar reporte |
| `DELETE` | `/reportes/:id` | Eliminar reporte |
| `GET` | `/reportes/mis-reportes` | Reportes del usuario autenticado |
| `GET` | `/reportes/export` | Exportar reportes (CSV/JSON) |
| `POST` | `/reportes/:id/like` | Dar o quitar like a un reporte |
| `GET` | `/reportes/trending` | Reportes con mÃ¡s likes (Ãºltima semana) |

### Reportes â€” EstadÃ­sticas

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `GET` | `/reportes/stats` | Totales generales (contador, por estado) |
| `GET` | `/reportes/stats/categoria` | DistribuciÃ³n por categorÃ­a |
| `GET` | `/reportes/stats/timeline` | EvoluciÃ³n temporal de reportes |
| `GET` | `/reportes/stats/heatmap` | Puntos georreferenciados para mapa de calor |
| `GET` | `/reportes/stats/ia` | Agregados de anÃ¡lisis IA para grÃ¡ficos |

### Reportes â€” Inteligencia Artificial

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `POST` | `/reportes/analizar-imagen` | Clasificar imagen antes de crear el reporte |
| `POST` | `/reportes/sugerir-contenido` | Sugerir tÃ­tulo y descripciÃ³n desde imÃ¡genes |
| `GET` | `/reportes/zonas-riesgo` | Zonas de riesgo predictivas georreferenciadas |
| `GET` | `/reportes/alertas-predictivas` | Alertas predictivas por zona |

### Chatbot

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `POST` | `/chatbot/mensaje` | Enviar mensaje al chatbot conversacional |
| `GET` | `/chatbot/faqs` | Obtener preguntas frecuentes |

### Notificaciones

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `GET` | `/notificaciones` | Listar notificaciones in-app |
| `GET` | `/notificaciones/contador` | Conteo de notificaciones no leÃ­das |
| `PATCH` | `/notificaciones/:uuid/leida` | Marcar notificaciÃ³n como leÃ­da |
| `PATCH` | `/notificaciones/marcar-todas` | Marcar todas como leÃ­das |
| `DELETE` | `/notificaciones/:uuid` | Eliminar notificaciÃ³n |
| `POST` | `/notificaciones/fcm-token` | Registrar token FCM para push notifications |

### AdministraciÃ³n (solo admin)

| MÃ©todo | Endpoint | DescripciÃ³n |
|---|---|---|
| `GET` | `/admin/usuarios/stats` | MÃ©tricas de usuarios registrados |
| `GET` | `/admin/usuarios` | Listar usuarios con paginaciÃ³n y filtros |
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

| Archivo | Tests | DescripciÃ³n |
|---|---|---|
| `src/components/FormSection.test.jsx` | 6 | Renderizado, Ã­cono, variantes danger/normal, children |
| `src/components/ProtectedRoute.test.jsx` | 5 | Spinner de carga, redirecciÃ³n a /login, roles |
| `src/pages/Auth.test.jsx` | 6 | Pantalla de autenticaciÃ³n, campos, OAuth |

**Cobertura mÃ­nima requerida:** 70% en lÃ­neas, funciones, ramas y sentencias.

---

## Pipeline CI/CD

Definido en `.github/workflows/CiFrontend.yml`. Se ejecuta en cada `push` y `pull_request` a `main`.

```
push / PR a main
        â”‚
        â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  lint   â”‚  ESLint 9 â€” analiza src/
   â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
        â”‚ pasa
        â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  test   â”‚  Vitest â€” 17+ tests unitarios
   â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
        â”‚ pasa
        â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚  build  â”‚  Vite â€” genera dist/ y sube artefacto
   â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
        â”‚ solo push a main
        â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ deploy  â”‚  peaceiris/actions-gh-pages â†’ GitHub Pages
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

| Job | Necesita | CondiciÃ³n |
|---|---|---|
| `lint` | â€” | siempre |
| `test` | `lint` | siempre |
| `build` | `test` | siempre |
| `deploy` | `build` | solo `push` a `main` |

---

## Licencia

Este proyecto estÃ¡ bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para mÃ¡s informaciÃ³n.
