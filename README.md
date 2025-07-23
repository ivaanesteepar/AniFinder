# AniFinder

<div align="center">
  <img src="/img/logo_app.png" alt="App logo" width="250">
</div>

Buscador web de anime que utiliza la API pública de AniList para mostrar resultados en tiempo real. Permite buscar títulos de anime y redirige a la página oficial de Crunchyroll para reproducirlos.

**⚠️ Esta aplicación está en desarrollo y puede contener errores o funcionalidades incompletas.**

> **Nota**: Esta herramienta ha sido creada principalmente para uso personal, pero la comparto públicamente para que pueda ser útil a otras personas interesadas.

## Características

- Búsqueda instantánea con sugerencias en vivo.
- Visualización de portadas y títulos en tarjetas.
- Al pulsar una tarjeta, abre la búsqueda en Crunchyroll.
- Si el buscador está vacío, muestra animes recomendados basados en popularidad.
- Diseño responsive y moderno con HTML, CSS y JavaScript puro.
- Utiliza la API GraphQL pública de AniList para datos actualizados.

## Cómo usar

1. Clona o descarga este repositorio.
   
    ```bash
   git clone https://github.com/ivaanesteepar/AniFinder
    ```
3. Abre el archivo `index.html` en tu navegador (recomendado usar un servidor local para evitar problemas CORS).
   
   ```bash
   python3 -m http.server
    ```
5. Escribe el nombre del anime en el buscador.
6. Haz clic en cualquier resultado para abrir Crunchyroll y ver el anime.

## Mejoras futuras

1. Sistema de autenticación: Añadir login y registro de usuarios para personalizar la experiencia, guardar favoritos y gestionar listas de seguimiento.

2. Restricción por edad: Implementar control parental o verificación de edad para filtrar contenido sensible o clasificado para mayores.

3. Favoritos y listas personalizadas: Permitir que los usuarios guarden animes favoritos, creen listas de seguimiento y reciban recomendaciones personalizadas.

5. Mejoras en la interfaz: Incluir paginación, filtros avanzados (géneros, estado, temporada), modo claro, oscuro, etc.

6. Migración a React: Reescribir la aplicación usando React para mejorar la mantenibilidad, facilitar la gestión del estado y optimizar la experiencia de usuario con componentes reutilizables.

---

Made with ❤️ by [Iván](https://github.com/ivaanesteepar)
