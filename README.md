<div align="center">
  <img src="/img/logo_app.png" alt="App logo" width="500" height="500">
</div>

Buscador web de anime que utiliza la API pública de **Jikan** para mostrar resultados en tiempo real. Permite buscar títulos de anime y redirige a la página oficial de **MyAnimeList** para ver detalles de cada anime.

**⚠️ Esta aplicación está en desarrollo y puede contener errores o funcionalidades incompletas.**

> **Nota**: Esta herramienta ha sido creada principalmente para uso personal, pero la comparto públicamente para que pueda ser útil a otras personas interesadas.

## Características

- Búsqueda instantánea con sugerencias en vivo.
- Visualización de portadas y títulos en tarjetas.
- Al pulsar una tarjeta, abre la página oficial del anime en MyAnimeList.
- Si el buscador está vacío, se muestran los últimos y próximos lanzamientos, así como animes recomendados por género, ordenados por popularidad.
- Diseño responsive y moderno con HTML, CSS y JavaScript puro.
- Utiliza la API pública de **Jikan** para datos actualizados de MyAnimeList.

## Cómo usar

### Usando la versión online (sin instalación)

1. Accede a la aplicación en:  
   [https://web-production-62dc.up.railway.app](https://web-production-62dc.up.railway.app)  
2. Escribe el nombre del anime en el buscador y explora los resultados en tiempo real.  
3. Haz clic en cualquier resultado para visitar la página oficial del anime en MyAnimeList.

### Usando la versión local

1. Clona o descarga este repositorio.
   
    ```bash
   git clone https://github.com/ivaanesteepar/AniFinder
    ```
3. Abre el archivo `index.html` en tu navegador (recomendado usar un servidor local para evitar problemas CORS).
   
   ```bash
   python3 -m http.server
    ```
5. Escribe el nombre del anime en el buscador.
6. Haz clic en cualquier resultado para abrir la página oficial del anime en MyAnimeList.

## Mejoras futuras

1. Restricción por edad: Implementar control parental o verificación de edad para filtrar contenido sensible o clasificado para mayores.
2. Favoritos y listas personalizadas: Permitir que los usuarios guarden animes favoritos, creen listas de seguimiento y reciban recomendaciones personalizadas.
3. Mejoras en la interfaz: Incluir paginación, filtros avanzados (géneros, estado, temporada), modo claro, oscuro, etc.
4. Migración a React: Reescribir la aplicación usando React para mejorar la mantenibilidad, facilitar la gestión del estado y optimizar la experiencia de usuario con componentes reutilizables.

---

Made with ❤️ by [Iván](https://github.com/ivaanesteepar)
