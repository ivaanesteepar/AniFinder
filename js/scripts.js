const input = document.getElementById('searchInput');
const loading = document.getElementById('loading');

const perfilLink = document.getElementById('perfilLink');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

const registerLink = document.getElementById('registerLink');
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const registerForm = document.getElementById('registerForm');

const filterButton = document.getElementById('filterButton');
const filterDropdown = document.getElementById('filterDropdown');

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
    //"hentai": 12,
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

        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${hoyISO}&order_by=start_date&sort=asc&limit=15`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            let animesUnicos = eliminarDuplicados(data.data);
            animesUnicos = filtrarHentai(animesUnicos); // filtrar hentai
            animesUnicos = animesUnicos.slice(0, 10);
            crearSeccionGenero('Próximos lanzamientos', animesUnicos, upcomingReleases);
        } else {
            console.log("No se han encontrado datos de próximos lanzamientos");
        }
    } catch (error) {
        console.error('Error al cargar próximos lanzamientos:', error);
    }
}

async function mostrarGeneros() {
    genreSections.innerHTML = '';

    for (const [genero, genreId] of generos.entries()) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=15`);

            if (!response.ok) {
                throw new Error(`Error ${response.status} en género ${genero}`);
            }

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const animesFiltrados = data.data.filter(anime => anime.popularity > 0).slice(0, 10);

                if (animesFiltrados.length > 0) {
                    crearSeccionGenero(genero, animesFiltrados, genreSections);
                } else {
                    console.log(`No hay animes con popularidad > 0 para el género: ${genero}`);
                }
            } else {
                console.log(`No hay resultados para el género: ${genero}`);
            }

        } catch (error) {
            console.error(`Error al cargar ${genero}:`, error);
        }

        // Espera 1 segundo para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
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

        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${startDate}&end_date=${endDate}&order_by=start_date&sort=desc&limit=20`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            let animesUnicos = eliminarDuplicados(data.data);
            animesUnicos = filtrarHentai(animesUnicos); // filtrar hentai
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
        const baseUrl = 'https://api.jikan.moe/v4/anime?limit=24';
        const params = [];

        if (query.trim().length > 0) {
            params.push(`q=${encodeURIComponent(query)}`);
        }

        // Filtrar géneros válidos (números)
        let genreNums = genres.filter(g => !isNaN(parseInt(g)));

        // Filtrar hentai si estuviera (por si acaso)
        genreNums = genreNums.filter(id => id !== 12);

        if (genreNums.length > 0) {
            params.push(`genres=${genreNums.join(',')}`);
            params.push('genres_exclude=0');
        }

        const url = params.length > 0 ? `${baseUrl}&${params.join('&')}` : baseUrl;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            results.innerHTML = '<p style="margin-top: 2rem;">No se encontraron animes.</p>';
            loading.style.display = 'none';
            return;
        }

        let animesUnicos = eliminarDuplicados(data.data);
        animesUnicos = filtrarHentai(animesUnicos); // filtrar hentai

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


if (perfilLink) {
    perfilLink.addEventListener('click', (e) => {
        const loggedIn = localStorage.getItem('loggedIn');
        if (loggedIn) {
            perfilLink.href = '../pages/perfil.html';
        } else {
            e.preventDefault();
            loginModal.style.display = 'block';
            perfilLink.href = '#';
        }
    });
}


// LOGIN
if (closeModal) {
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
        loginForm.reset();
        const errorDiv = document.getElementById("loginErrorMessage");
        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.style.display = "none";
        }
    });
}

window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
        loginForm.reset();
        const errorDiv = document.getElementById("loginErrorMessage");
        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.style.display = "none";
        }
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById("loginErrorMessage");
        errorDiv.style.display = "none";
        errorDiv.textContent = "";

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const response = await fetch("https://web-production-62dc.up.railway.app/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                loginModal.style.display = "none";
                localStorage.setItem('loggedIn', 'true');
                if (result.username) localStorage.setItem('username', result.username);
                if (result.email) localStorage.setItem('email', result.email);

                window.location.href = "../pages/perfil.html";
            } else {
                errorDiv.textContent = result.message || "Error en el inicio de sesión.";
                errorDiv.style.display = "block";
            }

        } catch (error) {
            console.error("Error al intentar iniciar sesión:", error);
            errorDiv.textContent = "Error al conectar con el servidor.";
            errorDiv.style.display = "block";
        }
    });
}


// REGISTRO
if (registerLink) {
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'block';
    });
}

if (closeRegisterModal) {
    closeRegisterModal.addEventListener('click', () => {
        if (registerModal) registerModal.style.display = 'none';
        if (registerForm) registerForm.reset();
        document.querySelectorAll("#registerModal .error-message").forEach(el => el.textContent = "");
    });
}

window.addEventListener('click', (event) => {
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
        registerForm.reset();
        document.querySelectorAll("#registerModal .error-message").forEach(el => el.textContent = "");
    }
});

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

        const username = registerForm.regUsername.value.trim();
        const email = registerForm.regEmail.value.trim();
        const password = registerForm.regPassword.value.trim();
        const repeatPassword = registerForm.regPasswordRepeat.value.trim();
        const birthday = registerForm.regBirthdate.value.trim();

        let valid = true;

        if (!username) {
            document.getElementById("errorUsername").textContent = "El usuario es obligatorio.";
            valid = false;
        }
        if (!email) {
            document.getElementById("errorEmail").textContent = "El correo electrónico es obligatorio.";
            valid = false;
        }
        if (!password) {
            document.getElementById("errorPassword").textContent = "La contraseña es obligatoria.";
            valid = false;
        }
        if (!repeatPassword) {
            document.getElementById("errorPasswordRepeat").textContent = "Repite la contraseña.";
            valid = false;
        }
        if (!birthday) {
            document.getElementById("errorBirthdate").textContent = "La fecha de nacimiento es obligatoria.";
            valid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (password && !passwordRegex.test(password)) {
            document.getElementById("errorPassword").textContent = "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.";
            valid = false;
        }

        if (password && repeatPassword && password !== repeatPassword) {
            document.getElementById("errorPasswordRepeat").textContent = "Las contraseñas no coinciden.";
            valid = false;
        }

        if (!valid) return;

        try {
            const response = await fetch("https://web-production-62dc.up.railway.app/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password, birthday })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('email', email);

                registerModal.style.display = "none";
                registerForm.reset();
                window.location.href = "../pages/perfil.html";
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error en fetch de registro:", error);
        }
    });
}


function tiene18anos(birthday) {
    if (!birthday) return false;

    const fechaNacimiento = new Date(birthday);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
    const diaDiff = hoy.getDate() - fechaNacimiento.getDate();

    // Ajustar edad si no ha cumplido años este año
    if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
        edad--;
    }

    return edad >= 18;
}


document.addEventListener("DOMContentLoaded", () => {
    // Código para menú hamburguesa
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("mobileMenu");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            navLinks.classList.toggle("active");
        });

        navLinks.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        document.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    }

    // Código para mostrar/ocultar el enlace favoritos
    const favoritosLink = document.getElementById('favoritosLink');
    const loggedInUser = localStorage.getItem('username');

    if (favoritosLink) {
        if (loggedInUser) {
            favoritosLink.style.display = 'block';
        } else {
            favoritosLink.style.display = 'none';
        }
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
filterButton.addEventListener('click', () => {
    filterDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
    if (!filterDropdown.contains(event.target) && !filterButton.contains(event.target)) {
        filterDropdown.classList.add('hidden');
    }
});

document.getElementById("applyFilters").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();

    selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
        .map(cb => genreMap[cb.value])
        .filter(id => id !== undefined);

    const resultsContainer = document.getElementById("results");

    if (selectedGenres.length === 0 && query === '') {
        resultsContainer.innerHTML = "";
        document.getElementById("latestReleases").style.display = "block";
        document.getElementById("upcomingReleases").style.display = "block";
        document.getElementById("genreSections").style.display = "block";
        return;
    }

    document.getElementById("latestReleases").style.display = "none";
    document.getElementById("upcomingReleases").style.display = "none";
    document.getElementById("genreSections").style.display = "none";

    resultsContainer.style.display = '';
    resultsContainer.innerHTML = '';
    loading.style.display = 'block';

    buscarAnime(query, selectedGenres);
});


cargarContenidoPrincipal();