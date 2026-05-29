# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifests antes del código fuente para aprovechar caché de capas
COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente y generar el bundle de producción
COPY . .
RUN npm run build

# ── Stage 2: Servir con nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Configuración nginx optimizada para SPA con HTML5 History API
RUN printf '%s\n' \
  'server {' \
  '    listen 80;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '' \
  '    gzip on;' \
  '    gzip_vary on;' \
  '    gzip_types text/plain text/css application/json application/javascript' \
  '               text/xml application/xml image/svg+xml;' \
  '' \
  '    # Assets con hash de contenido: caché inmutable de 1 año' \
  '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {' \
  '        expires 1y;' \
  '        add_header Cache-Control "public, immutable";' \
  '    }' \
  '' \
  '    # SPA fallback: cualquier ruta sirve index.html' \
  '    location / {' \
  '        try_files $uri $uri/ /index.html;' \
  '    }' \
  '}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
