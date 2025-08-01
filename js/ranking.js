let paginaActual = 1;
let totalPaginas = null; 

async function obtenerAnimesPorPagina(pagina) {
  const url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${pagina}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    totalPaginas = datos.pagination.last_visible_page; // Actualizar total de páginas

    mostrarAnimes(datos.data);
    crearPaginacion(); // Actualizamos la paginación tras obtener datos y total páginas
  } catch (error) {
    console.error("Error al obtener los animes populares:", error);
  }
}


function mostrarAnimes(animes) {
  const contenedor = document.getElementById('anime-list');
  contenedor.innerHTML = ''; // Limpiar animes previos

  // Filtrar duplicados por mal_id
  const animesUnicos = [];
  const idsVistos = new Set();

  animes.forEach(anime => {
    if (!idsVistos.has(anime.mal_id)) {
      idsVistos.add(anime.mal_id);
      animesUnicos.push(anime);
    }
  });

  const maxPopularidad = 5000;

  animesUnicos.forEach(anime => {
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
  if (!totalPaginas) return; // Si no sabemos el total, no mostramos paginación

  const paginacionCont = document.getElementById('paginacion');
  paginacionCont.innerHTML = '';

  // Botón "Primera página"
  if (paginaActual > 1) {
    const btnPrimera = document.createElement('button');
    btnPrimera.textContent = '« Primera';
    btnPrimera.onclick = () => {
      paginaActual = 1;
      obtenerAnimesPorPagina(paginaActual);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnPrimera);
  }

  // Botón página anterior
  if (paginaActual > 1) {
    const btnPrev = document.createElement('button');
    btnPrev.textContent = paginaActual - 1;
    btnPrev.onclick = () => {
      paginaActual--;
      obtenerAnimesPorPagina(paginaActual);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnNext);
  }

  // Botón "Última página"
  if (paginaActual < totalPaginas) {
    const btnUltima = document.createElement('button');
    btnUltima.textContent = 'Última »';
    btnUltima.onclick = () => {
      paginaActual = totalPaginas;
      obtenerAnimesPorPagina(paginaActual);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnUltima);
  }
}

// Inicializar
obtenerAnimesPorPagina(paginaActual);
