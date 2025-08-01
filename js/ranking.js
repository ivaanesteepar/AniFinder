let paginaActual = 1;
const totalPaginas = 10;

async function obtenerAnimesPorPagina(pagina) {
  const url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${pagina}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    mostrarAnimes(datos.data);
  } catch (error) {
    console.error("Error al obtener los animes populares:", error);
  }
}

function mostrarAnimes(animes) {
  const contenedor = document.getElementById('anime-list');
  contenedor.innerHTML = ''; // Limpiar animes previos

  const maxPopularidad = 5000;

  animes.forEach(anime => {
    const porcentaje = Math.max(0, 100 - (anime.popularity / maxPopularidad) * 100);

    const enlace = document.createElement('a');
    enlace.href = anime.url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.className = 'anime-card-link';

    const card = document.createElement('div');
    card.className = 'anime-card';

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

    enlace.appendChild(card);
    contenedor.appendChild(enlace);
  });
}

function crearPaginacion() {
  const paginacionCont = document.getElementById('paginacion');
  paginacionCont.innerHTML = '';

  // Botón página anterior
  if (paginaActual > 1) {
    const btnPrev = document.createElement('button');
    btnPrev.textContent = paginaActual - 1;
    btnPrev.onclick = () => {
      paginaActual--;
      obtenerAnimesPorPagina(paginaActual);
      crearPaginacion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnPrev);
  }

  // Botón página actual
  const btnActual = document.createElement('button');
  btnActual.textContent = paginaActual;
  btnActual.disabled = true;
  btnActual.classList.add('activo');
  paginacionCont.appendChild(btnActual);

  // Botón página siguiente
  if (paginaActual < totalPaginas) {
    const btnNext = document.createElement('button');
    btnNext.textContent = paginaActual + 1;
    btnNext.onclick = () => {
      paginaActual++;
      obtenerAnimesPorPagina(paginaActual);
      crearPaginacion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnNext);
  }
}



// Inicializar
obtenerAnimesPorPagina(paginaActual);
crearPaginacion();
