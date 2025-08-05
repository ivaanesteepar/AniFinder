document.addEventListener('DOMContentLoaded', () => {
    renderProfileImage();
    setupLogout();
    setupModalHandlers();
    setupFormSubmission();
    setupImagePreview();
    renderUserData();
});


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
    if (!logoutLink) return;

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
    
        // Oculta mensaje de error si está visible
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.style.display = 'none';
            formMessage.textContent = '';
        }
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

        let base64Image = localStorage.getItem('profileIconUrl');

        try {
            if (newProfileImageFile) {
                const reader = new FileReader();
                reader.onload = async function (event) {
                    base64Image = event.target.result;

                    // Actualizar backend y si va bien, actualizar localStorage
                    await updateProfile(newUsername, newEmail, newBirthday, base64Image);

                    localStorage.setItem('username', newUsername);
                    localStorage.setItem('email', newEmail);
                    localStorage.setItem('birthday', newBirthday);
                    localStorage.setItem('profileIconUrl', base64Image);

                    document.querySelector('#profileIconContainer img').src = base64Image;
                    finalizarActualizacion();
                };
                reader.readAsDataURL(newProfileImageFile);
            } else {
                await updateProfile(newUsername, newEmail, newBirthday, base64Image);

                localStorage.setItem('username', newUsername);
                localStorage.setItem('email', newEmail);
                localStorage.setItem('birthday', newBirthday);

                finalizarActualizacion();
            }
        } catch (error) {
            formMessage.textContent = 'Error al actualizar perfil: ' + error.message;
            formMessage.style.display = 'block';
        }

        function finalizarActualizacion() {
            modal.style.display = 'none';
            renderUserData();
        }
    });
}


async function updateProfile(username, email, birthday, profilepicBase64) {
    const response = await fetch('https://web-production-62dc.up.railway.app/update-profile', {
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


function renderUserData() {
    const userDataDiv = document.getElementById('userData');
    if (!userDataDiv) return;

    const username = localStorage.getItem('username') || 'No disponible';
    const email = localStorage.getItem('email') || 'No disponible';
    let birthday = localStorage.getItem('birthday') || 'No disponible';

    // Formatear fecha si existe y no es "No disponible"
    if (birthday !== 'No disponible') {
        const dateObj = new Date(birthday);
        if (!isNaN(dateObj)) {
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            birthday = `${day}-${month}-${year}`;
        }
    }

    userDataDiv.innerHTML = `
        <div class="user-field">
            <label>Nombre de usuario</label>
            <p>${username}</p>
        </div>
        <div class="user-field">
            <label>Correo</label>
            <p>${email}</p>
        </div>
        <div class="user-field">
            <label>Fecha de nacimiento</label>
            <p>${birthday}</p>
        </div>
    `;
}



