document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    renderProfileImage();
    setupLogout();
    setupModalHandlers();
    setupFormSubmission();
    setupImagePreview();
    showImagePreview();
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


function showImagePreview(src) {
    const imagePreview = document.getElementById('imagePreview');
    if (src) {
        imagePreview.src = src;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
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

    // Oculta la imagen preview al cargar la página
    imagePreview.style.display = 'none';
    imagePreview.style.maxWidth = '200px'; 

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
    const formMessage = document.getElementById('formMessage');

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formMessage.style.display = 'none';
        formMessage.textContent = '';

        const newUsername = document.getElementById('usernameInput').value.trim();
        const newEmail = document.getElementById('emailInput').value.trim();
        const newBirthday = document.getElementById('birthdayInput').value.trim();
        const newProfileImageFile = document.getElementById('profileImageInput').files[0];

        if (newUsername === '') {
            formMessage.textContent = 'El nombre de usuario no puede estar vacío';
            formMessage.style.display = 'block';
            return;
        }

        // Guardar localStorage
        localStorage.setItem('username', newUsername);
        localStorage.setItem('email', newEmail);
        localStorage.setItem('birthday', newBirthday);

        let base64Image = localStorage.getItem('profileIconUrl');

        try {
            if (newProfileImageFile) {
                const reader = new FileReader();
                reader.onload = async function (event) {
                    base64Image = event.target.result;
                    localStorage.setItem('profileIconUrl', base64Image);
                    document.querySelector('#profileIconContainer img').src = base64Image;

                    await updateProfile(newUsername, newEmail, newBirthday, base64Image);

                    finalizarActualizacion();
                };
                reader.readAsDataURL(newProfileImageFile);
            } else {
                await updateProfile(newUsername, newEmail, newBirthday, base64Image);
                finalizarActualizacion();
            }
        } catch (error) {
            formMessage.textContent = 'Error al actualizar perfil: ' + error.message;
            formMessage.style.display = 'block';
        }

        function finalizarActualizacion() {
            modal.style.display = 'none';
            const saludo = document.getElementById('saludo');
            if (saludo) saludo.textContent = `Hola, ${newUsername}`;
        }
    });
}


async function updateProfile(username, email, birthday, profilepicBase64) {
    const response = await fetch('/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email,
            birthday: birthday,
            profilepic: profilepicBase64
        })
    });

    const data = await response.json();
    if (!data.success) {
        alert('Error al actualizar perfil en backend: ' + data.message);
        throw new Error(data.message);
    }
}

