let paginaActual = 1;
let totalPaginas = null;

async function obtenerAnimesPorPagina(pagina) {
  // Si totalPaginas aún no está definido, obtenemos el last_visible real
  if (totalPaginas === null) {
    // Consulta página 1
    const urlPagina1 = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1`;
    const resp1 = await fetch(urlPagina1);
    const datos1 = await resp1.json();
    let lastVisible = datos1.pagination.last_visible_page;

    // Consulta la última página reportada para comprobar si hay más
    const urlUltima = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${lastVisible}`;
    const respUlt = await fetch(urlUltima);
    const datosUlt = await respUlt.json();

    // Actualiza si la última visible cambia
    if (datosUlt.pagination.last_visible_page !== lastVisible) {
      lastVisible = datosUlt.pagination.last_visible_page;
    }

    totalPaginas = lastVisible;
    console.log("Total páginas reales detectadas:", totalPaginas);
  }

  // Si el usuario pide página fuera de rango, corregir
  if (pagina > totalPaginas) {
    paginaActual = totalPaginas;
    return obtenerAnimesPorPagina(paginaActual);
  }

  const url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${pagina}`;
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    paginaActual = pagina;
    mostrarAnimes(datos.data);
    crearPaginacion();
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
  console.log("Total páginas:", totalPaginas);
  console.log("Página actual:", paginaActual);
  if (!totalPaginas) return;

  const paginacionCont = document.getElementById('paginacion');
  paginacionCont.innerHTML = '';

  // Botón "Primera página"
  if (paginaActual > 1) {
    const btnPrimera = document.createElement('button');
    btnPrimera.textContent = '« Primera';
    btnPrimera.onclick = () => {
      obtenerAnimesPorPagina(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnPrimera);
  }

  // Botón página anterior
  if (paginaActual > 1) {
    const btnPrev = document.createElement('button');
    btnPrev.textContent = paginaActual - 1;
    btnPrev.onclick = () => {
      obtenerAnimesPorPagina(paginaActual - 1);
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
  if (paginaActual + 1 <= totalPaginas) {
    const btnNext = document.createElement('button');
    btnNext.textContent = paginaActual + 1;
    btnNext.onclick = () => {
      const siguiente = paginaActual + 1;
      if (siguiente <= totalPaginas) {
        paginaActual = siguiente;
        obtenerAnimesPorPagina(paginaActual);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };    
    paginacionCont.appendChild(btnNext);
  }

  // Botón "Última página"
  if (paginaActual < totalPaginas) {
    const btnUltima = document.createElement('button');
    btnUltima.textContent = 'Última »';
    btnUltima.onclick = () => {
      obtenerAnimesPorPagina(totalPaginas);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionCont.appendChild(btnUltima);
  }
}


// Inicializar
obtenerAnimesPorPagina(paginaActual);
