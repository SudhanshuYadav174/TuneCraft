FROM node:20-alpine AS frontend-build
WORKDIR /app/FrontEnd

COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm ci

COPY FrontEnd/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/Backend

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev

COPY Backend/ ./

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=backend-build /app/Backend /app/Backend
COPY --from=frontend-build /app/FrontEnd/dist /app/FrontEnd/dist

EXPOSE 3000
CMD ["node", "/app/Backend/src/server.js"]
