const input = document.getElementById('searchInput');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const recommendedTitle = document.getElementById('recommendedTitle');

let timeoutId = null;

// Función para generar slug estilo animeflv
function generarSlug(titulo) {
    return titulo
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .replace(/[^a-z0-9\s-]/g, "")                    // elimina caracteres no alfanuméricos
        .trim()
        .replace(/\s+/g, "-");                           // reemplaza espacios por guiones
}

async function showRecommended() {
    recommendedTitle.style.display = "block";
    loading.style.display = 'block';
    results.innerHTML = '';

    const queryGraphQL = `
        query {
            Page(perPage: 24) {
                media(type: ANIME, sort: START_DATE_DESC) {
                    id
                    type
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: queryGraphQL }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Error en la respuesta GraphQL:', data.errors);
            alert('Error GraphQL: ' + JSON.stringify(data.errors));
            results.innerHTML = '<p>Error al cargar recomendados.</p>';
            loading.style.display = 'none';
            return;
        }

        const animeList = data.data.Page.media.filter(item => item.type === "ANIME");

        if (animeList.length === 0) {
            results.innerHTML = '<p>No se encontraron animes recomendados.</p>';
            loading.style.display = 'none';
            return;
        }

        animeList.forEach(anime => {
            const title = anime.title.english || anime.title.romaji;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
            `;
            card.addEventListener('click', () => {
                const slug = generarSlug(title);
                window.open(`https://www3.animeflv.net/ver/${slug}-1`, '_blank');
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

input.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const query = input.value.trim();

    if (query.length < 2) {
        showRecommended();
        recommendedTitle.style.display = "block";
        loading.style.display = 'none';
        return;
    }

    recommendedTitle.style.display = "none";
    loading.style.display = 'block';

    timeoutId = setTimeout(() => {
        buscarAnime(query);
    }, 500);
});

showRecommended();

async function buscarAnime(query) {
    const queryGraphQL = `
        query ($search: String) {
            Page(perPage: 12) {
                media(type: ANIME, search: $search) {
                    id
                    type
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    startDate {
                        year
                        month
                        day
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: queryGraphQL, variables: { search: query } }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Error en la respuesta GraphQL:', data.errors);
            results.innerHTML = '<p>Error en la búsqueda.</p>';
            loading.style.display = 'none';
            return;
        }

        const animeList = data.data.Page.media.filter(item => item.type === "ANIME");

        if (animeList.length === 0) {
            results.innerHTML = '<p>No se encontraron animes.</p>';
            loading.style.display = 'none';
            return;
        }

        results.innerHTML = '';
        animeList.forEach(anime => {
            const title = anime.title.english || anime.title.romaji;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
            `;
            card.addEventListener('click', () => {
                const slug = generarSlug(title);
                window.open(`https://www3.animeflv.net/ver/${slug}-1`, '_blank');
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

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
});

const perfilLink = document.getElementById('perfilLink');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

// Mostrar modal login al clicar en Perfil si no está logueado
perfilLink.addEventListener('click', (e) => {
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn) {
        // Si está logueado, ir a perfil.html
        perfilLink.href = '../pages/perfil.html';
    } else {
        // Si no está logueado, abrir modal login y evitar navegación
        e.preventDefault();
        loginModal.style.display = 'block';
        perfilLink.href = '#';
    }
});

// Cerrar modal login
closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Cerrar modal login clicando fuera
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Enviar formulario login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    if (username && password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', username);

        perfilLink.textContent = username;
        perfilLink.href = '#';

        loginModal.style.display = 'none';
        loginForm.reset();
    } else {
        alert('Introduce usuario y contraseña válidos');
    }
});

// --- Código modal registro ---
const registerLink = document.getElementById('registerLink');
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const registerForm = document.getElementById('registerForm');

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = registerForm.regUsername.value.trim();
    const password = registerForm.regPassword.value.trim();
    const passwordRepeat = registerForm.regPasswordRepeat.value.trim();

    if (password !== passwordRepeat) {
        alert('Las contraseñas no coinciden');
        return;
    }

    alert(`Registro completado para ${username}`);
    registerModal.style.display = 'none';
    registerForm.reset();
});
