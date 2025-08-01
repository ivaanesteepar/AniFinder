let paginaActual = 1;
let totalPaginas = null;
let primeraCarga = true;

// Cache para guardar los datos ya obtenidos por página
const cacheAnimesPorPagina = {};


async function fetchConRetry(url, retries = 3, delayMs = 2000) {
  for (let i = 0; i <= retries; i++) {
    const resp = await fetch(url);
    if (resp.status === 429) {
      if (i === retries) {
        throw new Error('Demasiados intentos: rate limit persistente');
      }
      console.warn(`Rate limit excedido, esperando ${delayMs}ms antes de reintentar...`);
      await new Promise(r => setTimeout(r, delayMs));
    } else {
      return resp;
    }
  }
}

async function obtenerAnimesPorPagina(pagina) {
  const spinner = document.getElementById('spinner');

  if (primeraCarga) {
    spinner.style.display = 'block';  
  }

  try {
    if (totalPaginas === null) {
      const urlPagina1 = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1`;
      const resp1 = await fetchConRetry(urlPagina1);
      const datos1 = await resp1.json();
      let lastVisible = datos1.pagination.last_visible_page;

      const urlUltima = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${lastVisible}`;
      const respUlt = await fetchConRetry(urlUltima);
      const datosUlt = await respUlt.json();

      if (datosUlt.pagination?.last_visible_page && datosUlt.pagination.last_visible_page !== lastVisible) {
        lastVisible = datosUlt.pagination.last_visible_page;
      }

      totalPaginas = lastVisible;
      console.log("Total páginas reales detectadas:", totalPaginas);
    }

    if (pagina > totalPaginas) {
      paginaActual = totalPaginas;
      if (primeraCarga) spinner.style.display = 'none'; 
      return obtenerAnimesPorPagina(paginaActual);
    }

    // Comprobar si ya tenemos cache para esta página
    if (cacheAnimesPorPagina[pagina]) {
      console.log(`Usando cache para página ${pagina}`);
      console.log(cacheAnimesPorPagina[pagina]);
      paginaActual = pagina;
      mostrarAnimes(cacheAnimesPorPagina[pagina]);
      crearPaginacion();
      return;
    }

    // Si no está en cache, hacemos la petición
    const url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${pagina}`;
    const respuesta = await fetchConRetry(url);
    const datos = await respuesta.json();

    if (!datos.data || !Array.isArray(datos.data)) {
      console.error("Datos inválidos recibidos de la API:", datos);
      mostrarAnimes([]);  // Mostrar vacío para evitar errores
      crearPaginacion();
      return;
    }

    // Guardamos en cache
    cacheAnimesPorPagina[pagina] = datos.data;

    paginaActual = pagina;
    mostrarAnimes(datos.data);
    crearPaginacion();

  } catch (error) {
    console.error("Error al obtener los animes populares:", error);
  } finally {
    if (primeraCarga) {
      spinner.style.display = 'none'; 
      primeraCarga = false;         
    }
  }
}

function resetEstado() {
  paginaActual = 1;
  totalPaginas = null;
  primeraCarga = true;
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
resetEstado();
obtenerAnimesPorPagina(paginaActual);
