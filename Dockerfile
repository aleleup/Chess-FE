# --- ETAPA 1: Construcción (Build) ---
# Usamos la imagen oficial de Node como base para compilar
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Compilamos la aplicación para producción
RUN npm run build -- --configuration=production


# --- ETAPA 2: Servidor de Producción ---
# Usamos Nginx para servir los archivos estáticos compilados
FROM nginx:alpine

# Copiamos el resultado del build de Node hacia la carpeta pública de Nginx
# NOTA: Reemplaza "nombre-de-tu-app" por el nombre real de tu proyecto en el angular.json
COPY --from=build /app/dist/nombre-de-tu-app/browser /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (opcional pero recomendada para rutas)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]