const username = localStorage.getItem('username');
const saludo = document.getElementById('saludo');
const profileIconUrl = localStorage.getItem('profileIconUrl');
const defaultIconUrl = '../img/default_profile_icon.jpg'; 
const container = document.getElementById('profileIconContainer');

if (username && saludo) {
    saludo.textContent = `Hola, ${username}`;
} else {
    window.location.href = '../pages/home.html'; // si no hay sesión
}

const img = document.createElement('img');
img.alt = 'Icono de perfil';
img.className = 'profile-img';

if (profileIconUrl && profileIconUrl.trim() !== '') {
    img.src = profileIconUrl;
} else {
    img.src = defaultIconUrl;
}

container.appendChild(img);

const logoutLink = document.getElementById('logoutLink');
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('birthday');
    localStorage.removeItem('profileIconUrl');
    window.location.href = '../pages/home.html';
});
