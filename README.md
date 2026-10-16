<div align="center">
  <img src="/img/logo_app.png" alt="App logo" width="500" height="500">
</div>

![En desarrollo](https://img.shields.io/badge/status-work_in_progress-yellow?style=for-the-badge&logo=github)

Buscador web estático de anime que consulta directamente la API pública de **Tenrai** para mostrar títulos y datos del catálogo de MyAnimeList. No requiere backend, cuentas ni base de datos.

## Características

- Búsqueda instantánea con sugerencias en vivo.
- Visualización de portadas y títulos en tarjetas.
- Al pulsar una tarjeta, abre la página oficial del anime en MyAnimeList.
- Si el buscador está vacío, se muestran los últimos y próximos lanzamientos, así como animes recomendados por género, ordenados por popularidad.
- Diseño responsive con HTML, CSS y JavaScript puro.
- Utiliza la API pública de **Tenrai**, compatible con el esquema de Jikan, para consultar el catálogo de MyAnimeList.

## Cómo usar

### Opción 1: Ejecutar online

Accede directamente a la aplicación en el siguiente enlace:  
👉 [AniFinder en GitHub Pages](https://ivaanesteepar.github.io/AniFinder/)

### Ejecutar en local

1. Clona o descarga este repositorio.
   
   ```bash
   git clone https://github.com/ivaanesteepar/AniFinder
   cd AniFinder
    ```

2. Sirve la carpeta con cualquier servidor estático. Por ejemplo, con Python:

   ```bash
   python3 -m http.server 8000
   ```

3. Abre `http://127.0.0.1:8000`.

---

Made with ❤️ by [Iván](https://github.com/ivaanesteepar)
