class AppModal extends HTMLElement {
  connectedCallback() {
    const botonCerrar = this.querySelector('.modal-cerrar');
    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => this.cerrar());
    }
    this.addEventListener('click', (evento) => {
      if (evento.target === this) this.cerrar();
    });
  }

  abrir(titulo) {
    const tituloEl = this.querySelector('.modal-titulo');
    if (tituloEl && titulo) {
      tituloEl.textContent = titulo;
    }
    this.classList.add('visible');
  }

  cerrar() {
    this.classList.remove('visible');
  }
}

customElements.define('app-modal', AppModal);
