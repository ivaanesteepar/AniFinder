const username = localStorage.getItem('username');
const saludo = document.getElementById('saludo');

if (username && saludo) {
    saludo.textContent = `Hola, ${username}`;
} else {
    // Opcional: redirigir si no hay sesión iniciada
    window.location.href = '../pages/home.html';
}

// Manejo del cierre de sesión
const logoutLink = document.getElementById('logoutLink');
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    window.location.href = '../pages/home.html';
});