<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Radar Cultural — Generador de Guiones para Reels

Asistente de edición técnica y estratégica de guiones para grabaciones de pantalla de la web [radarcultural.vercel.app](https://radarcultural.vercel.app).

## 🚀 Características

- **Generador de Guiones con IA (Gemini 2.5 Flash)**: Generación automática de guiones técnicos, copies para Instagram/TikTok y líneas de tiempo interactivas estructuradas.
- **Historial de Guiones Guardados**:
  - Almacenamiento local persistente (`localStorage`).
  - Búsqueda en tiempo real por título, texto, fecha o prompt.
  - Copiado rápido de copy para pie de Reel y guion técnico completo.
  - Modo pantalla completa con visor interactivo de timeline (capas de video, texto y audio).
  - Opciones de borrado individual o vaciado completo con confirmación modal.
  - Exportación de copias de seguridad en formato `.json`.
- **Integración con Supabase**: Carga automática de eventos culturales vigentes y sincronizados.

## 🛠️ Ejecución Local

**Requisitos:** Node.js 18+

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno en `.env.local` (o `.env`):
   ```env
   VITE_GEMINI_API_KEY=tu_api_key_de_gemini
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📦 Despliegue en Vercel

1. Hacé push / exportá el repositorio a GitHub desde AI Studio.
2. En el panel de **Vercel**, importá el repositorio de GitHub.
3. En la sección **Environment Variables** de Vercel, agregá:
   - `VITE_GEMINI_API_KEY`: Tu clave de API de Google Gemini.
4. Hacé clic en **Deploy**.
