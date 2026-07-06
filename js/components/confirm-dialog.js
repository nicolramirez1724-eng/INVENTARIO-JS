class ConfirmDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="confirm-caja">
        <p class="confirm-mensaje"></p>
        <div class="confirm-acciones">
          <button type="button" class="boton boton-secundario confirm-cancelar">Cancelar</button>
          <button type="button" class="boton boton-peligro confirm-aceptar">Eliminar</button>
        </div>
      </div>
    `;
    this.querySelector('.confirm-cancelar').addEventListener('click', () => this._cerrar(false));
    this.querySelector('.confirm-aceptar').addEventListener('click', () => this._cerrar(true));
    this.addEventListener('click', (evento) => {
      if (evento.target === this) this._cerrar(false);
    });
  }

  preguntar(mensaje) {
    this.querySelector('.confirm-mensaje').textContent = mensaje;
    this.classList.add('visible');
    return new Promise(resolve => {
      this._resolver = resolve;
    });
  }

  _cerrar(resultado) {
    this.classList.remove('visible');
    if (this._resolver) {
      this._resolver(resultado);
      this._resolver = null;
    }
  }
}

customElements.define('confirm-dialog', ConfirmDialog);
