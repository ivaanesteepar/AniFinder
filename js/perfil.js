document.addEventListener('DOMContentLoaded', () => {
    // Mostrar email y username para debug
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    console.log("Email desde localStorage:", email);
    console.log("Username desde localStorage:", username);

    checkUserSession();
    renderProfileImage();
    setupLogout();
    setupModalHandlers();
    setupFormSubmission();
    setupImagePreview();
});

/**
 * Verifica si el usuario tiene sesión iniciada y actualiza el saludo.
 */
function checkUserSession() {
    const username = localStorage.getItem('username');
    const saludo = document.getElementById('saludo');

    if (username && saludo) {
        saludo.textContent = `Hola, ${username}`;
    } else {
        window.location.href = '../pages/home.html'; // Redirigir si no hay sesión
    }
}

/**
 * Muestra la imagen de perfil desde localStorage o una por defecto.
 */
function renderProfileImage() {
    const profileIconUrl = localStorage.getItem('profileIconUrl');
    const defaultIconUrl = '../img/default_profile_icon.jpg';
    const container = document.getElementById('profileIconContainer');

    const img = document.createElement('img');
    img.alt = 'Icono de perfil';
    img.className = 'profile-img';
    img.src = profileIconUrl && profileIconUrl.trim() !== '' ? profileIconUrl : defaultIconUrl;

    container.prepend(img);
}

/**
 * Configura el enlace de logout para cerrar sesión y redirigir.
 */
function setupLogout() {
    const logoutLink = document.getElementById('logoutLink');
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('birthday');
        localStorage.removeItem('profileIconUrl');
        window.location.href = '../pages/home.html';
    });
}

/**
 * Configura el comportamiento del modal (abrir/cerrar).
 */
function setupModalHandlers() {
    const uploadBtn = document.getElementById('uploadProfilePicBtn');
    const modal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const imagePreview = document.getElementById('imagePreview');
    const form = document.getElementById('editProfileForm');

    uploadBtn.addEventListener('click', () => {
        modal.style.display = 'block';

        // Rellenar nombre actual
        const currentUsername = localStorage.getItem('username') || '';
        document.getElementById('usernameInput').value = currentUsername;

        // Rellenar email actual
        const currentEmail = localStorage.getItem('email') || '';
        console.log('Email desde localStorage:', currentEmail);
        document.getElementById('emailInput').value = currentEmail;

        // Rellenar birthday actual
        const currentBirthday = localStorage.getItem('birthday') || '';
        document.getElementById('birthdayInput').value = currentBirthday;

        // Precargar imagen actual si existe
        const currentImage = localStorage.getItem('profileIconUrl');
        if (currentImage) {
            imagePreview.src = currentImage;
            imagePreview.style.display = 'block';
        }
    });

    function closeAndResetModal() {
        modal.style.display = 'none';
        form.reset(); // Resetea los campos del formulario
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }

    closeModalBtn.addEventListener('click', closeAndResetModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeAndResetModal();
        }
    });
}

function setupImagePreview() {
    const fileInput = document.getElementById('profileImageInput');
    const imagePreview = document.getElementById('imagePreview');

    // Opcional: oculta la imagen preview al cargar la página
    imagePreview.style.display = 'none';
    imagePreview.style.maxWidth = '200px'; // para que no sea muy grande

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };

            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });
}


/**
 * Maneja la lógica del formulario de edición del perfil.
 */
function setupFormSubmission() {
    const editProfileForm = document.getElementById('editProfileForm');
    const modal = document.getElementById('editProfileModal');

    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newUsername = document.getElementById('usernameInput').value.trim();
        const newEmail = document.getElementById('emailInput').value.trim();
        const newBirthday = document.getElementById('birthdayInput').value.trim();
        const newProfileImageFile = document.getElementById('profileImageInput').files[0];

        if (newUsername === '') {
            alert('El nombre de usuario no puede estar vacío');
            return;
        }

        localStorage.setItem('username', newUsername);
        localStorage.setItem('email', newEmail);
        localStorage.setItem('birthday', newBirthday);

        if (newProfileImageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const base64Image = e.target.result;
                localStorage.setItem('profileIconUrl', base64Image);

                const profileImg = document.querySelector('#profileIconContainer img');
                profileImg.src = base64Image;
            };
            reader.readAsDataURL(newProfileImageFile);
        }

        alert('Perfil actualizado');
        modal.style.display = 'none';

        const saludo = document.getElementById('saludo');
        if (saludo) saludo.textContent = `Hola, ${newUsername}`;
    });
}

