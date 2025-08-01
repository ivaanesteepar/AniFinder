async function obtenerTop50AnimesPopulares() {
    const urls = [
      'https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1',
      'https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=2'
    ];

    try {
      const respuestas = await Promise.all(urls.map(url => fetch(url)));
      const datos = await Promise.all(respuestas.map(res => res.json()));
      const animes = datos.flatMap(d => d.data);
      mostrarAnimes(animes);
    } catch (error) {
      console.error("Error al obtener los animes populares:", error);
    }
  }

  function mostrarAnimes(animes) {
    const contenedor = document.getElementById('anime-list');
    const maxPopularidad = 5000;

    animes.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';

      const porcentaje = Math.max(0, 100 - (anime.popularity / maxPopularidad) * 100);

      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
        <div class="anime-info">
          <div class="anime-title">${anime.title}</div>
          <div class="barra-popularidad">
            <div class="barra-interna" style="width: ${porcentaje}%;"></div>
          </div>
          <div class="pop-rank">Popularidad #${anime.popularity}</div>
        </div>
      `;

      contenedor.appendChild(card);
    });
  }

  obtenerTop50AnimesPopulares();