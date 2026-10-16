const input = document.getElementById('searchInput');
const loading = document.getElementById('loading');

const filterButton = document.getElementById('filterButton');
const filterDropdown = document.getElementById('filterDropdown');
const clearFiltersButton = document.getElementById('clearFiltersButton');

const results = document.getElementById('results');
const latestReleases = document.getElementById('latestReleases');
const genreSections = document.getElementById('genreSections');
const upcomingReleases = document.getElementById('upcomingReleases');

let selectedGenres = [];
let timeoutId = null;

// Para la pantalla de inicio
const generos = new Map([
    ['Acción', 1],
    ['Romance', 22],
    ['Comedia', 4],
    ['Terror', 14],
    ['Fantasía', 10],
]);

// Para la búsqueda
const genreMap = {
    "action": 1,
    "adventure": 2,
    "cars": 3,
    "comedy": 4,
    "dementia": 5,
    "demons": 6,
    "mystery": 7,
    "drama": 8,
    "ecchi": 9,
    "fantasy": 10,
    "game": 11,
    "hentai": 12,
    "historical": 13,
    "horror": 14,
    "kids": 15,
    "magic": 16,
    "martial-arts": 17,
    "mecha": 18,
    "music": 19,
    "parody": 20,
    "samurai": 21,
    "romance": 22,
    "school": 23,
    "sci-fi": 24,
    "shoujo": 25,
    "shoujo-ai": 26,
    "shounen": 27,
    "shounen-ai": 28,
    "space": 29,
    "sports": 30,
    "super-power": 31,
    "vampire": 32,
    "yaoi": 33,
    "yuri": 34,
    "harem": 35,
    "slice-of-life": 36,
    "supernatural": 37,
    "military": 38,
    "police": 39,
    "psychological": 40,
    "thriller": 41,
    "seinen": 42,
    "josei": 43
};

function filtrarHentai(animes) {
    return animes.filter(anime => {
        if (!anime.genres) return true;
        return !anime.genres.some(g => g.mal_id === 12);
    });
}


async function mostrarProximosLanzamientos() {
    upcomingReleases.innerHTML = '';

    try {
        const hoy = new Date();
        const hoyISO = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
        let animesUnicos = [];
        let page = 1;

        // bucle hasta conseguir al menos 10 animes
        while (animesUnicos.length < 10) {
            const response = await AniFinderAPI.fetchAnimeApi(`https://api.tenrai.org/v1/anime?start_date=${hoyISO}&order_by=start_date&sort=asc&limit=25&page=${page}`);
            const data = await response.json();

            if (!data.data || data.data.length === 0) break; // no hay más resultados

            let nuevos = eliminarDuplicados(data.data);
            nuevos = filtrarHentai(nuevos);

            // Añadir solo los que aún no están
            nuevos.forEach(anime => {
                if (animesUnicos.length < 10 && !animesUnicos.some(a => a.mal_id === anime.mal_id)) {
                    animesUnicos.push(anime);
                }
            });

            // si ya tenemos 10, salimos
            if (animesUnicos.length >= 10) break;

            page++; // ir a la siguiente página
        }

        if (animesUnicos.length > 0) {
            crearSeccionGenero('Próximos lanzamientos', animesUnicos.slice(0, 10), upcomingReleases);
        } else {
            console.log("No se han encontrado datos de próximos lanzamientos");
        }
    } catch (error) {
        console.error('Error al cargar próximos lanzamientos:', error);
    }
}


async function mostrarGeneros() {
    genreSections.innerHTML = `
        <div class="genre-loading" role="status" aria-live="polite">
            <span class="genre-loading-spinner" aria-hidden="true"></span>
            <span>Cargando géneros...</span>
        </div>
    `;

    const resultados = await Promise.all(Array.from(generos.entries(), async ([genero, genreId]) => {
        try {
            const response = await AniFinderAPI.fetchAnimeApi(`https://api.tenrai.org/v1/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=15`);
            const data = await response.json();
            const animesFiltrados = (data.data || [])
                .filter(anime => anime.popularity > 0)
                .slice(0, 10);
            return { genero, animes: animesFiltrados };
        } catch (error) {
            console.error(`Error al cargar ${genero}:`, error);
            return { genero, animes: [] };
        }
    }));

    const filas = document.createDocumentFragment();
    resultados.forEach(({ genero, animes }) => {
        if (animes.length > 0) {
            crearSeccionGenero(genero, animes, filas);
        } else {
            console.log(`No hay resultados para el género: ${genero}`);
        }
    });
    genreSections.replaceChildren(filas);
}


function crearSeccionGenero(genero, animes, contenedor) {
    const section = document.createElement('section');
    section.className = 'genre-section';

    const header = document.createElement('h2');
    header.textContent = genero;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'anime-grid';

    animes.forEach(anime => {
        const title = anime.title_english || anime.title || anime.title_japanese || 'Sin título';
        const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A';
        const imageUrl = anime.images?.jpg?.image_url || '';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imageUrl}" alt="Portada de ${title}" />
            <div class="title">${title}</div>
            <div class="year">${year !== 'N/A' ? year : 'N/A'}</div>
        `;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.open(anime.url, '_blank');
        });

        grid.appendChild(card);
    });

    section.appendChild(grid);
    contenedor.appendChild(section);
}


async function mostrarUltimosLanzamientos() {
    try {
        const hoy = new Date();
        const yearActual = hoy.getFullYear();
        const startDate = `${yearActual}-01-01`;
        const endDate = hoy.toISOString().split('T')[0];

        const response = await AniFinderAPI.fetchAnimeApi(`https://api.tenrai.org/v1/anime?start_date=${startDate}&end_date=${endDate}&order_by=start_date&sort=desc&limit=20`);

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            let animesUnicos = eliminarDuplicados(data.data);
            animesUnicos = filtrarHentai(animesUnicos);
            const animesFinales = animesUnicos.slice(0, 10);
            latestReleases.innerHTML = ''; // limpia mensaje de carga
            crearSeccionGenero(`Últimos lanzamientos`, animesFinales, latestReleases);
        } else {
            console.log("No se han encontrado datos de últimos lanzamientos");
        }
    } catch (error) {
        console.error("Error al cargar últimos lanzamientos:", error);
    }
}


// Función para eliminar duplicados por mal_id
function eliminarDuplicados(animes) {
    const vistos = new Set();
    return animes.filter(anime => {
        if (vistos.has(anime.mal_id)) {
            return false;
        } else {
            vistos.add(anime.mal_id);
            return true;
        }
    });
}


if (input) {
    input.addEventListener('input', () => {
        clearTimeout(timeoutId);
        const query = input.value.trim();

        if (query.length === 0) {
            loading.style.display = 'none';
            results.innerHTML = '';
            results.style.display = 'none';

            latestReleases.style.display = 'block';
            genreSections.style.display = 'block';
            upcomingReleases.style.display = 'block';

            timeoutId = setTimeout(() => {
                cargarContenidoPrincipal();
            }, 300);

            return;
        }

        latestReleases.style.display = 'none';
        genreSections.style.display = 'none';
        upcomingReleases.style.display = 'none';

        results.style.display = '';
        results.innerHTML = '';
        loading.style.display = 'block';

        timeoutId = setTimeout(() => {
            buscarAnime(query, selectedGenres);
        }, 500);
    });
}


async function buscarAnime(query = '', genres = []) {
    try {
        const baseUrl = 'https://api.tenrai.org/v1/anime?limit=24';
        const params = [];

        if (query.trim().length > 0) {
            params.push(`q=${encodeURIComponent(query)}`);
        }

        const genreNums = genres
            .map(g => Number.parseInt(g, 10))
            .filter(id => Number.isInteger(id) && id !== 12);

        if (genreNums.length > 0) {
            params.push(`genres=${genreNums.join(',')}`);
        }
        params.push('genres_exclude=12');

        const url = params.length > 0 ? `${baseUrl}&${params.join('&')}` : baseUrl;

        const response = await AniFinderAPI.fetchAnimeApi(url);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            results.innerHTML = '<p style="margin-top: 2rem;">No se encontraron animes.</p>';
            loading.style.display = 'none';
            return;
        }

        let animesUnicos = eliminarDuplicados(data.data);
        animesUnicos = filtrarHentai(animesUnicos);

        results.innerHTML = '';
        animesUnicos.forEach(anime => {
            const title = anime.title_english || anime.title || anime.title_japanese || 'Sin título';
            const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
                <div class="year">${year !== 'N/A' ? year : 'N/A'}</div>
            `;
            card.addEventListener('click', () => {
                window.open(anime.url, '_blank');
            });
            results.appendChild(card);
        });

    } catch (error) {
        console.error('Error de red o excepción:', error);
        results.innerHTML = '<p>Error de red o servidor.</p>';
    } finally {
        loading.style.display = 'none';
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // Código para menú hamburguesa
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("mobileMenu");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", String(isOpen));
            hamburger.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
        });

        navLinks.addEventListener("click", (e) => {
            e.stopPropagation();
            if (e.target.closest("a")) {
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.setAttribute("aria-label", "Abrir menú");
            }
        });

        document.addEventListener("click", () => {
            navLinks.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.setAttribute("aria-label", "Abrir menú");
        });
    }

});


async function cargarContenidoPrincipal() {
    if (latestReleases) latestReleases.innerHTML = '';
    if (genreSections) genreSections.innerHTML = '';

    if (latestReleases) await mostrarUltimosLanzamientos();
    if (upcomingReleases) await mostrarProximosLanzamientos();
    if (genreSections) await mostrarGeneros();
}


// FILTROS
if (filterButton && filterDropdown) {
    filterButton.addEventListener('click', () => {
        filterDropdown.classList.toggle('hidden');
    });
}

if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => {
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        selectedGenres = [];
        document.querySelectorAll('input[name="genre"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });

        if (filterDropdown) filterDropdown.classList.add('hidden');
    });
}

document.addEventListener('click', (event) => {
    if (filterDropdown && filterButton && !filterDropdown.contains(event.target) && !filterButton.contains(event.target)) {
        filterDropdown.classList.add('hidden');
    }
});

const applyFiltersButton = document.getElementById("applyFilters");
if (applyFiltersButton) applyFiltersButton.addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();

    selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
        .map(cb => genreMap[cb.value])
        .filter(id => id !== undefined);

    const resultsContainer = document.getElementById("results");

    if (selectedGenres.includes(12)) {
        resultsContainer.innerHTML = "<p>Este género no está disponible.</p>";
        loading.style.display = 'none';
        document.getElementById("latestReleases").style.display = "none";
        document.getElementById("upcomingReleases").style.display = "none";
        document.getElementById("genreSections").style.display = "none";
        filterDropdown.classList.add('hidden');
        return;
    }

    if (selectedGenres.length === 0 && query === '') {
        resultsContainer.innerHTML = "";
        document.getElementById("latestReleases").style.display = "block";
        document.getElementById("upcomingReleases").style.display = "block";
        document.getElementById("genreSections").style.display = "block";
        filterDropdown.classList.add('hidden'); 
        return;
    }

    document.getElementById("latestReleases").style.display = "none";
    document.getElementById("upcomingReleases").style.display = "none";
    document.getElementById("genreSections").style.display = "none";

    resultsContainer.style.display = '';
    resultsContainer.innerHTML = '';
    loading.style.display = 'block';

    buscarAnime(query, selectedGenres);

    filterDropdown.classList.add('hidden');
});

cargarContenidoPrincipal();
