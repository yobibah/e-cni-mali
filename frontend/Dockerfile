FROM node:20-alpine AS build
ARG VITE_API_URL
ARG VITE_APP_NAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# SUPPRIME la config par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf
# COPIE ta configuration personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPIE les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]