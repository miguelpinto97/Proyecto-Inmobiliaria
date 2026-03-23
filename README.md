# Inmobiliaria Modelo Flash 🏠⚡

Aplicación web profesional para el sector inmobiliario con sistema de matching inteligente.

## 🚀 Stack Tecnológico

- **Frontend**: React + TypeScript + Vite.
- **Backend**: Netlify Functions (Node.js).
- **Base de Datos**: PostgreSQL (Neon).
- **Autenticación**: Google OAuth 2.0 + JWT propio.
- **Imágenes**: Cloudinary (con subidas firmadas seguras).

## 🛠️ Configuración Local

1. **Clonar el repositorio**.
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**:
   Crea un archivo `.env` basado en `.env.example`.
4. **Base de Datos**:
   Ejecuta los scripts en `sql/schema.sql` y `sql/seed.sql` en tu instancia de Neon (o cualquier PostgreSQL).
5. **Netlify Functions**:
   Instala `netlify-cli` globalmente (`npm install -g netlify-cli`) y corre:
   ```bash
   netlify dev
   ```
   Esto levantará tanto el frontend como el backend localmente.

## ✨ Características Principales

- **Landing Page Premium**: Diseño moderno y vendedor orientado a la conversión.
- **Auth Google**: Registro e inicio de sesión en un click.
- **Dashboard de Usuario**: Gestión de propiedades publicadas.
- **Matching Inteligente**: Encuentra propiedades que calcen con tus búsquedas o compradores interesados en tus inmuebles.
- **Panel Administrativo**: Moderación de contenido y gestión de límites de usuarios.
- **Cloudinary Integration**: Optimización automática de imágenes y subidas seguras desde el navegador.

## 🔐 Seguridad

- Middleware de autenticación para proteger endpoints de la API.
- Validación de roles (Admin/Usuario).
- Firmas seguras para subida de archivos (no hay secrets expuestos).
