// ==== Inicio ====

document.addEventListener("DOMContentLoaded", () => {
    configurarBuscador();
    configurarModales();
    configurarMenu();
    configurarFavoritos();
    cargarContenidoPrincipal();
});

const generos = new Map([
    ['Acción', 1],
    ['Romance', 22],
    ['Comedia', 4],
    ['Terror', 14],
    ['Fantasía', 10],
]);

let timeoutId = null;

// ==== Utilidades ====

function generarSlug(titulo) {
    return titulo
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}


function eliminarDuplicados(animes) {
    const vistos = new Set();
    return animes.filter(anime => {
        if (vistos.has(anime.mal_id)) return false;
        vistos.add(anime.mal_id);
        return true;
    });
}


function tiene18anos(birthday) {
    if (!birthday) return false;
    const fechaNacimiento = new Date(birthday);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
    const diaDiff = hoy.getDate() - fechaNacimiento.getDate();
    if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) edad--;
    return edad >= 18;
}

// ==== Contenido principal ====

async function mostrarProximosLanzamientos() {
    const upcomingReleases = document.getElementById('upcomingReleases');
    if (!upcomingReleases) return;

    upcomingReleases.innerHTML = '';
    try {
        const hoyISO = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${hoyISO}&order_by=start_date&sort=asc&limit=15`);
        const data = await response.json();
        if (data.data?.length > 0) {
            const animesUnicos = eliminarDuplicados(data.data).slice(0, 10);
            crearSeccionGenero('Próximos lanzamientos', animesUnicos, upcomingReleases);
        }
    } catch (error) {
        console.error('Error al cargar próximos lanzamientos:', error);
    }
}


async function mostrarUltimosLanzamientos() {
    const latestReleases = document.getElementById('latestReleases');
    if (!latestReleases) return;

    try {
        const hoy = new Date();
        const startDate = `${hoy.getFullYear()}-01-01`;
        const endDate = hoy.toISOString().split('T')[0];
        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${startDate}&end_date=${endDate}&order_by=start_date&sort=desc&limit=20`);
        const data = await response.json();
        if (data.data?.length > 0) {
            const animesFinales = eliminarDuplicados(data.data).slice(0, 10);
            latestReleases.innerHTML = '';
            crearSeccionGenero('Últimos lanzamientos', animesFinales, latestReleases);
        }
    } catch (error) {
        console.error("Error al cargar últimos lanzamientos:", error);
    }
}


async function mostrarGeneros() {
    const genreSections = document.getElementById('genreSections');
    if (!genreSections) return;

    genreSections.innerHTML = '';
    for (const [genero, genreId] of generos.entries()) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=10`);
            const data = await response.json();
            if (data.data?.length > 0) {
                crearSeccionGenero(genero, data.data, genreSections);
            }
        } catch (error) {
            console.error(`Error al cargar ${genero}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}


function crearSeccionGenero(genero, animes, contenedor) {
    const section = document.createElement('section');
    section.className = 'genre-section';
    section.innerHTML = `<h2>${genero}</h2><div class="anime-grid"></div>`;
    const grid = section.querySelector('.anime-grid');

    animes.forEach(anime => {
        const title = anime.title_english || anime.title || anime.title_japanese || 'Sin título';
        const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A';
        const imageUrl = anime.images?.jpg?.image_url || '';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imageUrl}" alt="Portada de ${title}" />
            <div class="title">${title}</div>
            <div class="year">${year}</div>
        `;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.open(anime.url, '_blank'));
        grid.appendChild(card);
    });

    contenedor.appendChild(section);
}


async function buscarAnime(query) {
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    if (!results || !loading) return;

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
        const data = await response.json();
        results.innerHTML = '';
        if (!data.data?.length) {
            results.innerHTML = '<p>No se encontraron animes.</p>';
            return;
        }

        eliminarDuplicados(data.data).forEach(anime => {
            const title = anime.title_english || anime.title || anime.title_japanese || 'Sin título';
            const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
                <div class="year">${year}</div>
            `;
            card.addEventListener('click', () => window.open(anime.url, '_blank'));
            results.appendChild(card);
        });
    } catch (error) {
        results.innerHTML = '<p>Error de red o servidor.</p>';
        console.error('Error al buscar anime:', error);
    } finally {
        loading.style.display = 'none';
    }
}


async function cargarContenidoPrincipal() {
    await mostrarUltimosLanzamientos();
    await mostrarProximosLanzamientos();
    await mostrarGeneros();
}

// ==== Listeners ====

function configurarBuscador() {
    const input = document.getElementById('searchInput');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const latestReleases = document.getElementById('latestReleases');
    const genreSections = document.getElementById('genreSections');
    const upcomingReleases = document.getElementById('upcomingReleases');

    if (!input) return;

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
            timeoutId = setTimeout(() => cargarContenidoPrincipal(), 300);
            return;
        }

        latestReleases.style.display = 'none';
        genreSections.style.display = 'none';
        upcomingReleases.style.display = 'none';

        results.innerHTML = '';
        results.style.display = '';
        loading.style.display = 'block';

        timeoutId = setTimeout(() => buscarAnime(query), 500);
    });
}


function configurarModales() {
    const perfilLink = document.getElementById('perfilLink');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const registerForm = document.getElementById('registerForm');

    if (perfilLink) {
        perfilLink.addEventListener('click', (e) => {
            const loggedIn = localStorage.getItem('loggedIn');
            if (loggedIn) {
                perfilLink.href = '../pages/perfil.html';
            } else {
                e.preventDefault();
                if (loginModal) loginModal.style.display = 'block';
                perfilLink.href = '#';
            }
        });
    }

    if (closeModal && loginModal && loginForm) {
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
            loginForm.reset();
            const errorDiv = document.getElementById("loginErrorMessage");
            if (errorDiv) errorDiv.style.display = "none";
        });
    }

    window.addEventListener('click', (event) => {
        if (loginModal && event.target === loginModal) {
            loginModal.style.display = 'none';
            if (loginForm) loginForm.reset();
        }
        if (registerModal && event.target === registerModal) {
            registerModal.style.display = 'none';
            if (registerForm) registerForm.reset();
        }
    });

    if (registerLink && loginModal && registerModal) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }

    if (closeRegisterModal && registerModal && registerForm) {
        closeRegisterModal.addEventListener('click', () => {
            registerModal.style.display = 'none';
            registerForm.reset();
        });
    }
}


function configurarMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('mobileMenu');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        navLinks.classList.toggle("active");
    });

    navLinks.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
}


function configurarFavoritos() {
    const favoritosLink = document.getElementById('favoritosLink');
    if (!favoritosLink) return;
    const user = localStorage.getItem('username');
    favoritosLink.style.display = user ? 'block' : 'none';
}


