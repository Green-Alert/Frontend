# GreenAlert — Frontend

Cliente web de GreenAlert construido con **React 18 + Vite 5 + Tailwind CSS v3**.  
Permite reportar, consultar y visualizar alertas ambientales en un mapa interactivo.

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18 |
| npm | 9 |
| Backend GreenAlert | corriendo en `http://localhost:3000` |

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Entorno de desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Previsualizar la build localmente
npm run preview
```

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia Vite en modo desarrollo con HMR |
| `npm run build` | Genera el bundle optimizado en `dist/` |
| `npm run preview` | Sirve el contenido de `dist/` localmente |

---

## Conexión con el backend

El frontend **no llama directamente** a `localhost:3000`. Todas las peticiones HTTP se hacen a rutas relativas bajo `/api/*` y `/uploads/*`, que Vite redirige en desarrollo:

| Prefijo | Destino | Nota |
|---|---|---|
| `/api/*` | `http://localhost:3000/*` | Elimina el prefijo `/api` |
| `/uploads/*` | `http://localhost:3000/uploads/*` | Sirve archivos estáticos del backend |

Configurado en `vite.config.js`. En producción, esta redirección debe replicarse en el servidor web (nginx, etc.).

---

## Stack tecnológico

| Librería | Versión | Uso |
|---|---|---|
| React | 18.3 | UI y gestión de estado |
| Vite | 5.3 | Bundler y servidor de desarrollo |
| Tailwind CSS | 3.4 | Estilos con design system personalizado |
| motion/react | 12 | Animaciones declarativas (antes Framer Motion) |
| React Router DOM | 6.23 | Enrutamiento SPA |
| Axios | 1.7 | Peticiones HTTP con interceptores |
| Leaflet + react-leaflet | 1.9 / 4.2 | Mapas interactivos |
| react-leaflet-cluster | 2.1 | Agrupación de marcadores en mapa |
| lucide-react | 0.577 | Iconografía SVG |

---

## Estructura del proyecto

```
frontend/
├── public/                        # Assets estáticos públicos
├── src/
│   ├── App.jsx                    # Árbol de rutas y providers globales
│   ├── main.jsx                   # Punto de entrada, monta <App />
│   ├── index.css                  # Estilos globales y clases Tailwind custom
│   │
│   ├── assets/                    # Imágenes y recursos importados en código
│   │
│   ├── components/                # Componentes reutilizables
│   │   ├── FormSection.jsx        # Contenedor de sección con título e ícono
│   │   ├── FormularioReporte.jsx  # Formulario multi-paso de nuevo reporte
│   │   ├── Layout.jsx             # Shell con Navbar + <Outlet>
│   │   ├── LocationPicker.jsx     # Selector de ubicación en mapa (Leaflet)
│   │   ├── Navbar.jsx             # Barra de navegación con dropdown de usuario
│   │   ├── PasswordStrengthIndicator.jsx  # Barra de fortaleza (5 criterios)
│   │   ├── ProtectedRoute.jsx     # Redirige a /login si no hay sesión activa
│   │   ├── ReportsMap.jsx         # Mapa con clusters de marcadores de reportes
│   │   └── ToastContainer.jsx     # Renderiza las notificaciones toast activas
│   │
│   ├── constants/
│   │   └── categorias.js          # Catálogo de categorías de riesgo con colores e íconos
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        # Sesión del usuario (login, logout, register)
│   │   └── ToastContext.jsx       # Sistema de notificaciones global
│   │
│   ├── pages/
│   │   ├── About.jsx              # Información del proyecto (pública)
│   │   ├── Dashboard.jsx          # Panel con estadísticas y mapa resumen
│   │   ├── Home.jsx               # Landing page pública
│   │   ├── Login.jsx              # Inicio de sesión
│   │   ├── NewReport.jsx          # Crear nuevo reporte
│   │   ├── NotFound.jsx           # Página 404
│   │   ├── Profile.jsx            # Perfil del usuario autenticado
│   │   ├── Register.jsx           # Registro de cuenta nueva
│   │   ├── ReportDetail.jsx       # Detalle de un reporte con evidencias y mapa
│   │   ├── Reports.jsx            # Listado y filtrado de reportes
│   │   └── Settings.jsx           # Configuración de cuenta y preferencias
│   │
│   ├── services/
│   │   └── api.js                 # Instancia Axios con interceptor de token JWT
│   │
│   └── utils/
│       └── animations.jsx         # Componentes de animación reutilizables (Reveal, CountUp)
│
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/` | `Home` | Público | Landing page; redirige a `/dashboard` si hay sesión |
| `/about` | `About` | Público | Información, misión y contacto del proyecto |
| `/login` | `Login` | Público | Inicio de sesión (pantalla completa, sin Layout) |
| `/register` | `Register` | Público | Registro de cuenta (pantalla completa, sin Layout) |
| `/dashboard` | `Dashboard` | Privado | Estadísticas generales y mapa resumen |
| `/reports` | `Reports` | Privado | Listado de reportes con filtros |
| `/reports/new` | `NewReport` | Privado | Crear nuevo reporte |
| `/reports/:id` | `ReportDetail` | Privado | Detalle, evidencias y mapa del reporte |
| `/nuevo-reporte` | `FormularioReporte` | Privado | Formulario multi-paso alternativo |
| `/profile` | `Profile` | Privado | Perfil del usuario |
| `/settings` | `Settings` | Privado | Configuración de la cuenta |
| `*` | `NotFound` | Público | Página 404 |

Las rutas privadas están envueltas en `<ProtectedRoute>`, que redirige a `/login` si no existe sesión activa.

---

## Autenticación

- Basada en **JWT**.
- El token y los datos del usuario se persisten en `localStorage` con las claves `ga_token` y `ga_user`.
- `AuthContext` expone: `user`, `login(email, password)`, `register(...)`, `logout()`, `updateUser(data)`.
- El servicio Axios en `services/api.js` adjunta automáticamente el header `Authorization: Bearer <token>` en cada petición.
- `logout()` limpia el localStorage, resetea el estado y muestra una notificación `top-center`.

---

## Sistema de notificaciones (Toast)

El sistema es **dual-posición** y está centralizado en `ToastContext`.

### API

```js
const { showToast } = useToast();

// Firma completa
showToast(message, type?, duration?, options?)

// Parámetros
// message   string   — Texto principal de la notificación
// type      string   — 'success' | 'error' | 'warning' | 'info'  (default: 'info')
// duration  number   — Milisegundos antes de cerrar             (default: 3000)
// options   object   — { position?, subtitle? }
//   position  'bottom-right' | 'top-center'                     (default: 'bottom-right')
//   subtitle  string   — Texto secundario debajo del mensaje
```

### Ejemplos de uso

```js
// Toast estándar (esquina inferior derecha)
showToast('Reporte enviado correctamente', 'success');

// Toast de autenticación (centro superior, con subtítulo)
showToast('¡Bienvenido, Juan!', 'success', 5000, {
  position: 'top-center',
  subtitle: 'Has iniciado sesión correctamente',
});

// Toast de cierre de sesión
showToast('Sesión cerrada', 'info', 3500, {
  position: 'top-center',
  subtitle: 'Hasta pronto',
});
```

### Variantes visuales

| Posición | Componente | Diseño |
|---|---|---|
| `bottom-right` | `ToastCompact` | Card compacta, desliza desde la derecha, barra de progreso inferior |
| `top-center` | `ToastAuth` | Card grande con ícono temático, subtítulo, `backdrop-blur`, desliza desde arriba |

`ToastContainer` se monta una sola vez en `App.jsx` y renderiza ambas pilas de forma independiente.

---

## Animaciones

Toda la capa de animación usa **`motion/react`** (importar siempre desde `'motion/react'`, no `'framer-motion'`).

### Utilidades en `utils/animations.jsx`

| Componente | Props | Descripción |
|---|---|---|
| `Reveal` | `children`, `delay`, `className` | Fade + slide al entrar al viewport (scroll-reveal, `once: true`) |
| `CountUp` | `target`, `className` | Contador animado de 0 a `target` al entrar al viewport |

```jsx
import { Reveal, CountUp } from '../utils/animations';

<Reveal delay={0.1}>
  <p>Este texto aparece al hacer scroll</p>
</Reveal>

<CountUp target={1234} className="text-4xl font-bold text-green-400" />
```

### Patrones de animación usados en las páginas

- **Dual-panel (Login / Register):** panel izquierdo desliza desde `x: -32`, panel derecho desde `x: 32`; campos en stagger con `delay: 0.28 + i * 0.08`
- **Pasos del formulario (FormularioReporte):** `AnimatePresence` con `key={step}`; avanzar desliza `x: 28 → 0`, retroceder invierte la dirección
- **Scroll-reveal general:** componente `Reveal` con `margin: '-70px'` para activar antes del borde
- **Entrada de página:** `motion.div` con `initial={{ opacity: 0, y: 8 }}` y `duration: 0.2`

---

## Páginas destacadas

### Login y Register

Diseño de **dos paneles** (lg+): panel izquierdo decorativo con features del producto y panel derecho con el formulario. En mobile y tablet el panel decorativo se oculta.

- Eye/EyeOff (Lucide) para mostrar/ocultar contraseña
- `PasswordStrengthIndicator` en Register evalúa 5 criterios en tiempo real: 8+ caracteres, mayúscula, minúscula, número y carácter especial
- Al autenticarse o registrarse se dispara un toast `top-center` con nombre del usuario y subtítulo

### Dashboard

- Estadísticas con `CountUp` y tarjetas de resumen
- Mapa de calor con `ReportsMap` y clusters de reportes

### Reports

- Filtros por categoría, estado y severidad
- Tarjetas con franja de color según categoría
- Paginación y estado vacío ilustrado

### ReportDetail

- Franja de color `h-1.5` en la parte superior según categoría del reporte
- Header con ícono grande de categoría + badges de severidad y estado (`text-sm`)
- Descripción con `text-justify`
- Galería de evidencias: grid 2-3 columnas con `aspect-video` por imagen
- Mapa iframe de **OpenStreetMap** centrado en las coordenadas del reporte (si `latitud` y `longitud` están disponibles)
- Botón "Volver a reportes" sticky en mobile (`top-0 z-10 backdrop-blur`), oculto en lg+

### Profile

- Sidebar de navegación: **Perfil**, **Seguridad**, **Actividad**
- Hero card con avatar degradado, badge de rol y barra de completitud del perfil
- Edición inline de nombre, apellido y teléfono
- Sección Seguridad con cambio de contraseña y `PasswordStrengthIndicator`

### Settings

- Sidebar de navegación alineada al design system de Profile
- Gestión de preferencias de cuenta y notificaciones

### About

- Hero con logo, título y tagline con gradiente verde
- Secciones con `Reveal`: "¿Qué es GreenAlert?", "Misión y valores", "¿Cómo funciona?", "Contacto"
- Estadísticas animadas con `CountUp`

### NotFound (404)

- "404" gigante con gradiente `green-400 → emerald-600`
- Ícono `Leaf` con rotación continua suave
- Dos CTAs: "Volver al inicio" y "Ver reportes"

---

## Endpoints del backend que consume el frontend

| Método | Ruta | Página / Contexto |
|---|---|---|
| `POST` | `/auth/login` | `AuthContext.login` |
| `POST` | `/auth/register` | `AuthContext.register` |
| `GET` | `/auth/perfil` | `Profile` |
| `PUT` | `/auth/perfil` | `Profile` (edición inline) |
| `PUT` | `/auth/cambiar-password` | `Profile` (sección Seguridad) |
| `GET` | `/reportes` | `Reports`, `Dashboard` |
| `GET` | `/reportes/:id` | `ReportDetail` |
| `POST` | `/reportes` | `FormularioReporte` / `NewReport` |
| `GET` | `/categorias-riesgo` | `FormularioReporte`, `Reports` |

---

## Variables de entorno

El frontend no requiere un archivo `.env` para desarrollo. El proxy de Vite maneja la redirección al backend.

Para producción, si se usa un proxy diferente, asegurarse de configurar correctamente el origen del backend.

---

## Responsive design

Las páginas están diseñadas para los siguientes breakpoints de Tailwind:

| Breakpoint | Ancho | Comportamiento |
|---|---|---|
| `sm` | 640 px | Formularios en columna, tipografía ajustada |
| `md` | 768 px | — |
| `lg` | 1024 px | Activa paneles laterales y sidebars |
| `xl` | 1280 px | Anchos máximos del contenido |

Breakpoints verificados: **375 px, 768 px, 1024 px, 1440 px**.  
Botones con altura mínima de 44 px para cumplir guías de accesibilidad táctil.
| `PATCH` | `/auth/perfil` | Actualizar nombre / apellido / teléfono |
| `PATCH` | `/auth/cambiar-contrasena` | Cambiar contraseña |

## Configuracion de cuenta (`/settings`)

- Mismo patrón de sidebar: **Notificaciones**, **Privacidad**, **Cuenta**, **Zona peligrosa**.
- **Notificaciones**: toggles por categoría con ícono propio y pill buttons de frecuencia.
- **Privacidad**: política de privacidad y descarga de datos (próximamente).
- **Cuenta**: mini tarjeta del usuario, estado de email verificado, cerrar sesión global.
- **Zona peligrosa**: desactivar cuenta via modal; eliminar cuenta requiere escribir `ELIMINAR` para habilitar el botón (patrón GitHub/Vercel).

## Componentes reutilizables

### `FormSection`
Contenedor de sección con título, ícono y soporte de modo peligro (borde rojo).

```jsx
<FormSection title="Mi sección" icon={User}>
  ...contenido...
</FormSection>

<FormSection title="Zona peligrosa" icon={AlertTriangle} danger>
  ...contenido...
</FormSection>
```

### `PasswordStrengthIndicator`
Barra segmentada de 5 criterios: longitud ≥ 8, mayúscula, minúscula, número, carácter especial.

```jsx
<PasswordStrengthIndicator password={value} />
<PasswordStrengthIndicator password={value} showRequirements={false} />
```

Colores: rojo (1/5) → naranja (2/5) → amarillo (3/5) → verde claro (4/5) → verde (5/5).
