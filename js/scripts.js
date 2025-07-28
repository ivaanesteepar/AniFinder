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

const generos = new Map([
    ['Acción', 1],
    ['Drama', 8],
    ['Comedia', 4],
    ['Terror', 14],
    ['Fantasía', 10],
]);

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
    genreSections.innerHTML = ''; // Limpia la sección
    console.log("Cargando géneros sin usar caché...");

    for (const [genero, genreId] of generos.entries()) {
        try {
            console.log(`Solicitando datos para género: ${genero} (ID: ${genreId})`);
            const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity&sort=desc&limit=10`);

            if (!response.ok) {
                throw new Error(`Error ${response.status} en género ${genero}`);
            }

            const data = await response.json();

            console.log(`Datos recibidos para ${genero}:`, data);

            if (data.data && data.data.length > 0) {
                console.log(`Mostrando género: ${genero}, cantidad: ${data.data.length}`);
                crearSeccionGenero(genero, data.data, genreSections);
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
    console.log(`Mostrando género: ${genero}, cantidad: ${animes.length}`);


    section.appendChild(grid);
    contenedor.appendChild(section);
}


async function mostrarUltimosLanzamientos() {
    results.innerHTML = '';
    latestReleases.innerHTML = '';

    try {
        const hoy = new Date();
        const yearActual = hoy.getFullYear();

        const startDate = `${yearActual}-01-01`;
        const endDate = hoy.toISOString().split('T')[0]; // Formato: YYYY-MM-DD

        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${startDate}&end_date=${endDate}&order_by=start_date&sort=desc&limit=20`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const animesUnicos = eliminarDuplicados(data.data);
            const animesFinales = animesUnicos.slice(0, 10); // Solo 10 más recientes
            crearSeccionGenero(`Últimos lanzamientos`, animesFinales, latestReleases);
        } else {
            latestReleases.innerHTML = `<p>No hay animes de ${yearActual} hasta la fecha.</p>`;
        }

    } catch (error) {
        console.error("Error al cargar últimos lanzamientos:", error);
        latestReleases.innerHTML = '<p>Error cargando últimos lanzamientos.</p>';
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


input.addEventListener('input', async () => {
    clearTimeout(timeoutId);
    const query = input.value.trim();

    if (query.length === 0) {
        loading.style.display = 'none';
        results.innerHTML = '';
        results.style.display = 'none';

        latestReleases.style.display = 'block';
        genreSections.style.display = 'block';

        await cargarContenidoPrincipal();

        return;
    }

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
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            results.innerHTML = '<p>No se encontraron animes.</p>';
            loading.style.display = 'none';
            return;
        }

        results.innerHTML = '';
        data.data.forEach(anime => {
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


// Código modales login y registro (sin cambios relevantes)
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

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

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

    const response = await fetch("https://web-production-62dc.up.railway.app/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
        console.log("El usuario ha iniciado sesión correctamente:", result);
        alert("Inicio de sesión exitoso");
        loginModal.style.display = "none";
        localStorage.setItem('loggedIn', 'true');
        
        // Guardar el nombre de usuario si está presente
        if (result.username) {
            localStorage.setItem('username', result.username);
        }

        if (result.birthday) {
            localStorage.setItem('birthday', result.birthday);
        }
    
        window.location.href = "../pages/perfil.html";
    } else {
        alert(result.message);
    }
    
});


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


registerForm.addEventListener("submit", async (e) => {
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

    const response = await fetch("https://web-production-62dc.up.railway.app/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password, birthday })
    });

    const result = await response.json();

    if (result.success) {
        alert("Registro exitoso");
        registerModal.style.display = "none";
    } else {
        alert(result.message);
    }
});


async function cargarContenidoPrincipal() {
    latestReleases.innerHTML = '';
    genreSections.innerHTML = '';

    await mostrarUltimosLanzamientos();
    await mostrarGeneros();
}

cargarContenidoPrincipal();

