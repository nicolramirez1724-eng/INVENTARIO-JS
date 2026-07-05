class DataTable extends HTMLElement {
  constructor() {
    super();
    this._columnas = [];
    this._filas = [];
    this._idClave = 'id';
    this._conAcciones = false;
    this._mostrarEditar = true;
    this._mostrarEliminar = true;
    this._etiquetaEditar = 'Editar';
  }

  set columnas(valor) {
    this._columnas = valor;
    this._render();
  }

  set filas(valor) {
    this._filas = valor;
    this._render();
  }

  set idClave(valor) {
    this._idClave = valor;
  }

  set conAcciones(valor) {
    this._conAcciones = valor;
    this._render();
  }

  set mostrarEditar(valor) {
    this._mostrarEditar = valor;
    this._render();
  }

  set mostrarEliminar(valor) {
    this._mostrarEliminar = valor;
    this._render();
  }

  set etiquetaEditar(valor) {
    this._etiquetaEditar = valor;
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    if (!this._filas.length) {
      this.innerHTML = '<div class="mensaje-vacio">No hay registros para mostrar</div>';
      return;
    }
    const encabezados = this._columnas.map(columna => `<th>${columna.etiqueta}</th>`).join('');
    const filasHtml = this._filas.map(fila => {
      const celdas = this._columnas.map(columna => `<td>${columna.formatear ? columna.formatear(fila[columna.clave], fila) : (fila[columna.clave] ?? '')}</td>`).join('');
      const botonEditar = this._mostrarEditar
        ? `<button class="boton boton-secundario boton-editar" data-id="${fila[this._idClave]}">${this._etiquetaEditar}</button>`
        : '';
      const botonEliminar = this._mostrarEliminar
        ? `<button class="boton boton-peligro boton-eliminar" data-id="${fila[this._idClave]}">Eliminar</button>`
        : '';
      const acciones = this._conAcciones
        ? `<td class="acciones-fila">${botonEditar}${botonEliminar}</td>`
        : '';
      return `<tr>${celdas}${acciones}</tr>`;
    }).join('');
    const columnaAcciones = this._conAcciones ? '<th>Acciones</th>' : '';
    this.innerHTML = `
      <div class="tabla-contenedor">
        <table>
          <thead><tr>${encabezados}${columnaAcciones}</tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
      </div>
    `;
    this.querySelectorAll('.boton-editar').forEach(boton => {
      boton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('editar-fila', { detail: { id: boton.dataset.id } }));
      });
    });
    this.querySelectorAll('.boton-eliminar').forEach(boton => {
      boton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('eliminar-fila', { detail: { id: boton.dataset.id } }));
      });
    });
  }
}

customElements.define('data-table', DataTable);
