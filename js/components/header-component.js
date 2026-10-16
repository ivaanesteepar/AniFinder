class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
          <nav class="navbar">
            <div class="logo">
              <a href="../pages/home.html">
                <img src="../img/logo_app.png" alt="Buscador Anime" height="90px" width="160px" />
              </a>
            </div>
            <button class="hamburger" id="hamburger" type="button" aria-controls="mobileMenu" aria-expanded="false" aria-label="Abrir menú">
              <span aria-hidden="true">&#9776;</span>
            </button>
            <ul class="nav-links" id="mobileMenu">
              <li><a href="../pages/ranking.html">Ranking</a></li>
            </ul>
          </nav>
        </header>
      `;

        const currentPath = window.location.pathname.split('/').pop(); // nombre archivo actual

        const navLinks = this.querySelectorAll('.nav-links li a');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }
}

customElements.define('header-component', HeaderComponent);
