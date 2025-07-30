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
    ['Romance', 22],
    ['Comedia', 4],
    ['Terror', 14],
    ['Fantasía', 10],
]);

const results = document.getElementById('results');
const latestReleases = document.getElementById('latestReleases');
const genreSections = document.getElementById('genreSections');
const upcomingReleases = document.getElementById('upcomingReleases');

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


async function mostrarProximosLanzamientos() {
    upcomingReleases.innerHTML = '';

    try {
        const hoy = new Date();
        const hoyISO = hoy.toISOString().split('T')[0]; // YYYY-MM-DD

        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=${hoyISO}&order_by=start_date&sort=asc&limit=15`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            // Filtrar duplicados
            const animesUnicos = eliminarDuplicados(data.data).slice(0, 10);
            crearSeccionGenero('Próximos lanzamientos', animesUnicos, upcomingReleases);
        } else {
            console.log("No se han encontrado datos de próximos lanzamientos")
        }
    } catch (error) {
        console.error('Error al cargar próximos lanzamientos:', error);
    }
}


async function mostrarGeneros() {
    genreSections.innerHTML = '';

    for (const [genero, genreId] of generos.entries()) {
        try {
            console.log(`Solicitando datos para género: ${genero} (ID: ${genreId})`);
            const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=10`);

            if (!response.ok) {
                throw new Error(`Error ${response.status} en género ${genero}`);
            }

            const data = await response.json();
            if (data.data && data.data.length > 0) {
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
            const animesUnicos = eliminarDuplicados(data.data);
            const animesFinales = animesUnicos.slice(0, 10);
            latestReleases.innerHTML = ''; // limpia mensaje de carga
            crearSeccionGenero(`Últimos lanzamientos`, animesFinales, latestReleases);
        } else {
            console.log("No se han encontrado datos de últimos lanzamientos")
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
            buscarAnime(query);
        }, 500);
    });
}


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

        // Elimina duplicados antes de mostrarlos
        const animesUnicos = eliminarDuplicados(data.data);

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


// Código modales login y registro
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

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById("loginErrorMessage");
        errorDiv.style.display = "none";
        errorDiv.textContent = "";

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
            loginModal.style.display = "none";
            localStorage.setItem('loggedIn', 'true');

            if (result.username) localStorage.setItem('username', result.username);
            if (result.birthday) localStorage.setItem('birthday', result.birthday);
            if (result.profilepic) {
                localStorage.setItem('profileIconUrl', result.profilepic);
            } else {
                localStorage.removeItem('profileIconUrl');
            }

            window.location.href = "../pages/perfil.html";
        } else {
            errorDiv.textContent = result.message || "Error en el inicio de sesión.";
            errorDiv.style.display = "block";
        }
        if (result.success) {
            //alert("Inicio de sesión exitoso");
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
            console.error("Error en el resultado")
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


if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Limpiar mensajes de error antes
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

        if (!valid) return;  // No enviamos si no es válido

        // Si es válido, enviamos el fetch
        try {
            const response = await fetch("https://web-production-62dc.up.railway.app/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password, birthday })
            });

            const result = await response.json();

            console.log("Respuesta registro:", result);

            if (result.success) {
                alert("Registro exitoso");
                registerModal.style.display = "none";
                registerForm.reset();
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('birthday', birthday);
                window.location.href = "../pages/perfil.html";
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error en fetch de registro:", error);
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("mobileMenu");

    if (hamburger && navLinks) {
        // Toggle del menú al hacer clic en el botón hamburguesa
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation(); // Previene que el click llegue al document
            navLinks.classList.toggle("active");
        });

        // Previene el cierre si haces clic dentro del menú
        navLinks.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Cierra el menú si haces clic fuera de él
        document.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const favoritosLink = document.getElementById('favoritosLink');
    const loggedInUser = localStorage.getItem('username');

    if (loggedInUser) {
        favoritosLink.style.display = 'block';
    } else {
        favoritosLink.style.display = 'none';
    }
});


async function cargarContenidoPrincipal() {
    if (latestReleases) latestReleases.innerHTML = '';
    if (genreSections) genreSections.innerHTML = '';

    if (latestReleases) await mostrarUltimosLanzamientos();
    if (upcomingReleases) await mostrarProximosLanzamientos();
    if (genreSections) await mostrarGeneros();
}


cargarContenidoPrincipal();

