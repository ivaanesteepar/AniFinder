<div align="center">
  <img src="/img/logo_app.png" alt="App logo" width="500" height="500">
</div>

![En desarrollo](https://img.shields.io/badge/status-work_in_progress-yellow?style=for-the-badge&logo=github)
![Backend offline](https://img.shields.io/badge/backend-offline-red?style=for-the-badge)

Buscador web de anime que utiliza la API pública de **Jikan** para mostrar resultados en tiempo real. Permite buscar títulos de anime y redirige a la página oficial de **MyAnimeList** para ver detalles de cada anime.

> **Nota**: Esta herramienta ha sido creada principalmente para uso personal, pero la comparto públicamente para que pueda ser útil a otras personas interesadas.  
> ⚠️ **El backend actualmente no funciona**, ya que no he encontrado un hosting gratuito adecuado para desplegarlo.

## Características

- Búsqueda instantánea con sugerencias en vivo.
- Visualización de portadas y títulos en tarjetas.
- Al pulsar una tarjeta, abre la página oficial del anime en MyAnimeList.
- Si el buscador está vacío, se muestran los últimos y próximos lanzamientos, así como animes recomendados por género, ordenados por popularidad.
- Diseño responsive y moderno con HTML, CSS y JavaScript puro.
- Utiliza la API pública de **Jikan** para datos actualizados de MyAnimeList.

## Cómo usar

### Opción 1: Ejecutar online

Accede directamente a la aplicación en el siguiente enlace:  
👉 [AniFinder en GitHub Pages](https://ivaanesteepar.github.io/AniFinder/)

### Opción 2: Ejecutar en local

1. Clona o descarga este repositorio.
   
   ```bash
   git clone https://github.com/ivaanesteepar/AniFinder
   cd AniFinder
    ```

2. Instala las dependencias necesarias.

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
    ```

3. Para evitar problemas de CORS al abrir los archivos HTML, ejecuta un servidor local con Python.
   
   ```bash
   python3 -m http.server
    ```

---

Made with ❤️ by [Iván](https://github.com/ivaanesteepar)
