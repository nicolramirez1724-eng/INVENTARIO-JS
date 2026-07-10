class AppHeader extends HTMLElement {
  static get observedAttributes() {
    return ['nombre', 'cargo', 'seccion'];
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const nombre = this.getAttribute('nombre') || '';
    const cargo = this.getAttribute('cargo') || '';
    const seccion = this.getAttribute('seccion') || 'inventario';
    this.innerHTML = `
      <header class="encabezado-app">
        <div class="marca-app">
          <span class="logo-app">Acme</span>
          <span class="planta-app">Planta Macondo</span>
        </div>
        <nav class="nav-app">
          <button data-seccion="inventario" class="${seccion === 'inventario' ? 'activo' : ''}">Inventario</button>
          <button data-seccion="produccion" class="${seccion === 'produccion' ? 'activo' : ''}">Produccion</button>
          <button data-seccion="usuarios" class="${seccion === 'usuarios' ? 'activo' : ''}">Usuarios</button>
          <button data-seccion="reporte" class="${seccion === 'reporte' ? 'activo' : ''}">Reporte</button>
        </nav>
        <div class="usuario-app">
          <div class="datos-usuario">
            <span class="nombre-usuario">${nombre}</span>
            <span class="cargo-usuario">${cargo}</span>
          </div>
          <button class="boton-salir">Salir</button>
        </div>
      </header>
    `;
    this.querySelectorAll('.nav-app button').forEach(boton => {
      boton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('cambiar-seccion', { detail: { seccion: boton.dataset.seccion } }));
      });
    });
    this.querySelector('.boton-salir').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('cerrar-sesion'));
    });
  }
}

customElements.define('app-header', AppHeader);
