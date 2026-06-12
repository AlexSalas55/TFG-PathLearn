# PathLearn

Este trabajo presenta el diseño e implementación de PathLearn, un sistema educativo geolocalizado que integra inteligencia artificial generativa y datos de OpenStreetMap para crear cuestionarios adaptados a la ubicación del usuario y fomentar el aprendizaje *in situ*. El sistema consta de una plataforma web para docentes y una aplicación móvil para estudiantes, ambas conectadas en tiempo real.

El profesorado puede diseñar actividades asistidas por inteligencia artificial y supervisar el progreso del alumnado. Por su parte, los estudiantes interactúan con el entorno respondiendo preguntas directamente en el lugar visitado, ya sea de forma autónoma o participando en sesiones guiadas mediante un código.

El desarrollo se llevó a cabo siguiendo una metodología de diseño centrado en el usuario, y el sistema fue validado mediante pruebas de usabilidad con usuarios reales. Los resultados evidencian el potencial de combinar inteligencia artificial y geolocalización para fomentar el aprendizaje activo fuera del aula, reducir la carga de creación de contenidos y facilitar la supervisión docente.

## Proyectos

El repositorio incluye dos partes:

- **pathlearn-web** — Plataforma web para docente y alumno: creación de actividades con IA, publicación por código, supervisión de sesiones y modos de exploración libre.
- **pathlearn-app** — Aplicación móvil solo para el alumno: exploración geolocalizada, acceso a actividades por código.

## Requisitos

- Node.js (v18 o superior recomendado)
- Cuenta en [Supabase](https://supabase.com) y clave de [Google AI](https://aistudio.google.com)

## Configuración

En cada proyecto, crea un archivo `.env` con tus claves antes de ejecutar.

**pathlearn-web** (`.env` en la carpeta `pathlearn-web/`):

```
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_clave
VITE_GOOGLE_AI_KEY=tu_clave
```

**pathlearn-app** (`.env` en la carpeta `pathlearn-app/`):

```
EXPO_PUBLIC_SUPABASE_URL=tu_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave
EXPO_PUBLIC_GOOGLE_AI_KEY=tu_clave
```

## Ejecución

Instala dependencias en cada carpeta (`npm install`) y luego:

```bash
# Plataforma web (docente y estudiante)
cd pathlearn-web
npm run dev

# Aplicación móvil (estudiante)
cd pathlearn-app
npx expo start
```
