// Modo oscuro / claro
const toggleBtn = document.getElementById('toggle-theme');

toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        toggleBtn.textContent = '☀️';  // Sol en modo oscuro
    } else {
        toggleBtn.textContent = '🌙';  // Luna en modo claro
    }
});


// Scroll suave al hacer clic en enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Actualizar año automáticamente en el footer
const year = new Date().getFullYear();
document.querySelector('.footer p').textContent = `© ${year} Ivan`;

// Animación al hacer scroll (IntersectionObserver)
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    observer.observe(section);
});

window.addEventListener('load', () => {
    const toast = document.createElement('div');
    toast.textContent = '¡Bienvenido a mi sitio!';
    toast.style.position = 'fixed';
    toast.style.top = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '8px';
    toast.style.opacity = '0.95';
    toast.style.fontSize = '16px';
    toast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300); // Espera a que se desvanezca
    }, 3000);
});

const scrollBar = document.createElement('div');
scrollBar.style.position = 'fixed';
scrollBar.style.bottom = '0';
scrollBar.style.right = '0';
scrollBar.style.width = '5px';           // ancho fijo
scrollBar.style.height = '0%';           // altura inicial 0
scrollBar.style.backgroundColor = '#00bcd4';
scrollBar.style.zIndex = '9999';
scrollBar.style.transition = 'height 0.25s ease';
document.body.appendChild(scrollBar);

window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    scrollBar.style.height = `${scrollPercent * 100}%`; // altura aumenta con scroll
});




