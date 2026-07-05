class AppToast extends HTMLElement {
  mostrar(mensaje, tipo = 'exito') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    this.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

customElements.define('app-toast', AppToast);
