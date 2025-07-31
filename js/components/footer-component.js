class FooterComponent extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
            <footer style="background-color:#222; color:#eee; padding: 15px 20px; text-align: center; font-size: 0.9rem;">
                <div class="footer-links">
                    <p>
                        <a href="https://instagram.com/ivaanesteepar" target="_blank" rel="noopener">
                            <img src="../img/instagram.png" alt="Instagram" />
                        </a>
                        <a href="https://www.linkedin.com/in/iván-estépar-a95206233" target="_blank" rel="noopener">
                            <img src="../img/linkedin.png" alt="LinkedIn" />
                        </a>
                        <a href="https://github.com/ivaanesteepar" target="_blank" rel="noopener" class="github-icon">
                            <img src="../img/github.png" alt="Github" />
                        </a>
                    </p>
                </div>
                <p style="margin-top: 20px;">© 2025 Iván. Todos los derechos reservados.</p>
            </footer>
      `;
    }
  }
  
  customElements.define('footer-component', FooterComponent);
  