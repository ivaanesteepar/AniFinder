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

const generos = ['Action', 'Romance', 'Comedy', 'Horror', 'Fantasy'];

const results = document.getElementById('results');
const latestReleases = document.getElementById('latestReleases');
const genreSections = document.getElementById('genreSections');

let timeoutId = null;

// Genera un slug a partir del título
function generarSlug(titulo) {
    return titulo
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .replace(/[^a-z0-9\s-]/g, "")  // elimina caracteres no alfanuméricos
        .trim()
        .replace(/\s+/g, "-");  // reemplaza espacios por guiones
}


async function mostrarGeneros() {
    const genreSections = document.getElementById('genreSections');
    genreSections.innerHTML = ''; // Limpia antes de cargar

    for (const genero of generos) {
        const queryGraphQL = `
            query ($genre: String) {
                Page(perPage: 10) {
                    media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        siteUrl
                        startDate {
                            year
                        }
                    }
                }
            }
        `;

        try {
            const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: queryGraphQL,
                    variables: { genre: genero }
                })
            });

            const data = await response.json();
            const animeList = data.data.Page.media;

            if (animeList.length > 0) {
                const section = document.createElement('section');
                section.className = 'genre-section';
                section.innerHTML = `<h2>${genero}</h2>`;

                const container = document.createElement('div');
                container.className = 'genre-results';

                animeList.forEach(anime => {
                    const title = anime.title.english || anime.title.romaji;
                    const year = anime.startDate?.year || 'N/A';
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img src="${anime.coverImage.large}" alt="${title}">
                        <div class="title">${title}</div>
                        <div class="year">${year}</div>
                    `;
                    card.addEventListener('click', () => {
                        window.open(anime.siteUrl, '_blank');
                    });
                    container.appendChild(card);
                });

                section.appendChild(container);
                genreSections.appendChild(section);
            }

        } catch (error) {
            console.error(`Error al cargar ${genero}:`, error);
        }
    }
}


async function mostrarUltimosLanzamientos() {
    results.innerHTML = '';
    latestReleases.innerHTML = '';

    const section = document.createElement('section');
    section.className = 'genre-section';
    section.innerHTML = '<h2>Últimos lanzamientos</h2>';

    const container = document.createElement('div');
    container.className = 'genre-results';

    try {
        const query = `
            query {
                Page(perPage: 10) {
                    media(type: ANIME, sort: START_DATE_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        siteUrl
                        startDate {
                            year
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        const animes = data.data.Page.media;

        animes.forEach(anime => {
            const title = anime.title.english || anime.title.romaji;
            const card = document.createElement('div');
            const year = anime.startDate?.year || 'N/A';
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="${title}">
                <div class="title">${title}</div>
                <div class="year">${year}</div>
            `;
            card.addEventListener('click', () => {
                window.open(anime.siteUrl, '_blank');
            });
            container.appendChild(card);
        });

        section.appendChild(container);
        latestReleases.appendChild(section);

    } catch (error) {
        console.error("Error al cargar recomendados:", error);
    }
}


input.addEventListener('input', () => {
    clearTimeout(timeoutId);
    const query = input.value.trim();

    if (query.length === 0) {
        loading.style.display = 'none';
        results.innerHTML = '';
        results.style.display = 'none';

        latestReleases.style.display = 'block';
        genreSections.style.display = 'block';

        console.log('Mostrando recomendados y géneros');

        mostrarUltimosLanzamientos();
        mostrarGeneros();

        return;
    }

    // Cuando hay búsqueda
    latestReleases.style.display = 'none';
    genreSections.style.display = 'none';

    results.style.display = '';
    results.innerHTML = ''; 
    loading.style.display = 'block';

    timeoutId = setTimeout(() => {
        buscarAnime(query);
    }, 500);
});


async function buscarAnime(query) {
    const queryGraphQL = `
        query ($search: String) {
            Page(perPage: 12) {
                media(type: ANIME, search: $search) {
                    id
                    type
                    title {
                        native
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    startDate {
                        year
                    }
                    siteUrl
                }
            }
        }
    `;

    console.log('Buscando anime:', query);

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
            const year = anime.startDate?.year || 'N/A';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${anime.coverImage.large}" alt="Portada de ${title}" />
                <div class="title">${title}</div>
                <div class="year">${year !== 'N/A' ? year : 'N/A'}</div>
            `;
            card.addEventListener('click', () => {
                window.open(anime.siteUrl, '_blank');
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

// --- Código modal login ---
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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value.trim();

  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (result.success) {
    alert("Inicio de sesión exitoso");
    document.getElementById("loginModal").style.display = "none";
  } else {
    alert(result.message);
  }
});


document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = registerForm.regUsername.value.trim();
  const email = registerForm.regEmail.value.trim();
  const password = registerForm.regPassword.value.trim();
  const repeatPassword = registerForm.regPasswordRepeat.value.trim();
  const birthday = registerForm.regBirthdate.value.trim();

  if (password !== repeatPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  console.log({ username, email, password, birthday });

  const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password, birthday })
  });

  const result = await response.json();

  if (result.success) {
    alert("Registro exitoso");
    document.getElementById("registerModal").style.display = "none";
  } else {
    alert(result.message);
  }
});

mostrarUltimosLanzamientos(); // Mostrar últimos lanzamientos al cargar la página
mostrarGeneros(); // Mostrar géneros al cargar la página

