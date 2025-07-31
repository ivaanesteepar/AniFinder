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
                        <div class="hamburger" id="hamburger">&#9776;</div>
                        <ul class="nav-links" id="mobileMenu">
                            <li><a href="../pages/ranking.html">Ranking</a></li>
                            <li id="favoritosLink"><a href="../pages/favoritos.html">Favoritos</a></li>
                            <li><a href="#" id="perfilLink">Perfil</a></li>
                        </ul>
                    </nav>
                </header>
      `;
    }
}

customElements.define('header-component', HeaderComponent);
