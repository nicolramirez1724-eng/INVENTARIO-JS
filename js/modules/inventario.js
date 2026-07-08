async function renderInventario(contenedor) {
  contenedor.innerHTML = `
    <div class="encabezado-seccion">
      <h2>Inventario</h2>
      <div class="acciones-formulario">
        <button id="boton-ingresar-stock" class="boton boton-secundario">Ingresar al inventario</button>
        <button id="boton-nuevo-producto" class="boton boton-primario">Nuevo producto</button>
      </div>
    </div>
    <div class="barra-herramientas">
      <input type="text" id="buscador-productos" class="buscador" placeholder="Buscar por codigo, nombre o proveedor">
    </div>
    <div class="tarjeta">
      <data-table id="tabla-productos"></data-table>
    </div>
  `;

  const tabla = contenedor.querySelector('#tabla-productos');
  tabla.idClave = 'codigo';
  tabla.conAcciones = true;
  tabla.columnas = [
    { clave: 'codigo', etiqueta: 'Codigo' },
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'proveedor', etiqueta: 'Proveedor' },
    { clave: 'stock', etiqueta: 'Stock disponible' },
    { clave: 'receta', etiqueta: 'Tipo', formatear: receta => receta ? '<span class="etiqueta-formula">Fabricado</span>' : 'Materia prima' }
  ];

  async function actualizarTabla(filtro = '') {
    const productos = Object.values(await getProductos()).filter(p =>
      p.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(filtro.toLowerCase())
    );
    tabla.filas = productos;
  }

  await actualizarTabla();

  contenedor.querySelector('#buscador-productos').addEventListener('input', (evento) => {
    actualizarTabla(evento.target.value);
  });

  const modalProducto = document.getElementById('modal-producto');
  const formularioProducto = document.getElementById('formulario-producto');
  const errorProducto = document.getElementById('producto-error');
  const checkFormula = document.getElementById('producto-tiene-formula');
  const seccionFormula = document.getElementById('seccion-formula');
  const filasFormula = document.getElementById('filas-formula');
  const toast = document.querySelector('app-toast');
  const dialogo = document.getElementById('dialogo-confirmar');

  async function crearFilaFormula(codigoSeleccionado = '', cantidad = '') {
    const codigoEnEdicion = document.getElementById('producto-codigo-original').value;
    const productos = await getProductos();
    const opciones = Object.values(productos)
      .filter(p => p.codigo !== codigoEnEdicion)
      .map(p => `<option value="${p.codigo}" ${p.codigo === codigoSeleccionado ? 'selected' : ''}>${p.nombre} (${p.codigo})</option>`)
      .join('');
    const fila = document.createElement('div');
    fila.className = 'fila-receta';
    fila.innerHTML = `
      <div class="campo">
        <label>Materia prima</label>
        <select class="select-materia-prima">
          <option value="">Selecciona</option>
          ${opciones}
        </select>
      </div>
      <div class="campo">
        <label>Cantidad</label>
        <input type="number" class="input-cantidad-materia-prima" min="1" step="1" value="${cantidad}">
      </div>
      <button type="button" class="boton boton-peligro boton-quitar-fila">Quitar</button>
    `;
    fila.querySelector('.boton-quitar-fila').addEventListener('click', () => fila.remove());
    filasFormula.appendChild(fila);
  }

  checkFormula.addEventListener('change', () => {
    seccionFormula.classList.toggle('oculto', !checkFormula.checked);
    if (checkFormula.checked && filasFormula.children.length === 0) {
      crearFilaFormula();
    }
  });

  document.getElementById('agregar-fila-formula').addEventListener('click', () => crearFilaFormula());

  contenedor.querySelector('#boton-nuevo-producto').addEventListener('click', () => {
    formularioProducto.reset();
    document.getElementById('producto-codigo-original').value = '';
    document.getElementById('producto-codigo').disabled = false;
    filasFormula.innerHTML = '';
    seccionFormula.classList.add('oculto');
    errorProducto.textContent = '';
    modalProducto.abrir('Nuevo producto');
  });

  tabla.addEventListener('editar-fila', async (evento) => {
    const productos = await getProductos();
    const producto = productos[evento.detail.id];
    if (!producto) return;
    formularioProducto.reset();
    document.getElementById('producto-codigo-original').value = producto.codigo;
    document.getElementById('producto-codigo').value = producto.codigo;
    document.getElementById('producto-codigo').disabled = true;
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-proveedor').value = producto.proveedor;
    filasFormula.innerHTML = '';
    if (producto.receta) {
      checkFormula.checked = true;
      seccionFormula.classList.remove('oculto');
      const receta = Array.isArray(producto.receta)
        ? producto.receta.filter(item => item && item.codigo)
        : Object.entries(producto.receta).map(([codigo, cantidad]) => ({ codigo, cantidad }));
      for (const item of receta) {
        await crearFilaFormula(item.codigo, item.cantidad);
      }
    } else {
      checkFormula.checked = false;
      seccionFormula.classList.add('oculto');
    }
    errorProducto.textContent = '';
    modalProducto.abrir('Editar producto');
  });

  tabla.addEventListener('eliminar-fila', async (evento) => {
    const confirmado = await dialogo.preguntar('Deseas eliminar este producto?');
    if (!confirmado) return;
    await eliminarProductoDB(evento.detail.id);
    toast.mostrar('Producto eliminado');
    actualizarTabla(contenedor.querySelector('#buscador-productos').value);
  });

  formularioProducto.onsubmit = async (evento) => {
    evento.preventDefault();
    errorProducto.textContent = '';
    const codigoOriginal = document.getElementById('producto-codigo-original').value;
    const codigo = document.getElementById('producto-codigo').value.trim();
    const nombre = document.getElementById('producto-nombre').value.trim();
    const proveedor = document.getElementById('producto-proveedor').value.trim();
    const productos = await getProductos();

    if (!codigo || !nombre || !proveedor) {
      errorProducto.textContent = 'Completa todos los campos';
      return;
    }

    if (!codigoOriginal && productos[codigo]) {
      errorProducto.textContent = 'Ya existe un producto con ese codigo';
      return;
    }

    let receta = null;
    if (checkFormula.checked) {
      receta = [];
      const filas = filasFormula.querySelectorAll('.fila-receta');
      for (const fila of filas) {
        const codigoMateriaPrima = fila.querySelector('.select-materia-prima').value;
        const cantidad = Number(fila.querySelector('.input-cantidad-materia-prima').value);
        if (!codigoMateriaPrima || !cantidad || cantidad <= 0) {
          errorProducto.textContent = 'Completa correctamente todas las filas de la formula';
          return;
        }
        receta.push({ codigo: codigoMateriaPrima, cantidad });
      }
      if (receta.length === 0) {
        errorProducto.textContent = 'Agrega al menos una materia prima a la formula';
        return;
      }
    }

    const stockActual = codigoOriginal ? productos[codigoOriginal].stock : 0;

    if (codigoOriginal && codigoOriginal !== codigo) {
      await eliminarProductoDB(codigoOriginal);
    }

    await guardarProducto({ codigo, nombre, proveedor, stock: stockActual, receta });
    toast.mostrar(codigoOriginal ? 'Producto actualizado' : 'Producto creado');
    modalProducto.cerrar();
    actualizarTabla(contenedor.querySelector('#buscador-productos').value);
  };

  const modalIngreso = document.getElementById('modal-ingreso-stock');
  const formularioIngreso = document.getElementById('formulario-ingreso-stock');
  const errorIngreso = document.getElementById('ingreso-error');
  const selectIngreso = document.getElementById('ingreso-codigo');

  contenedor.querySelector('#boton-ingresar-stock').addEventListener('click', async () => {
    formularioIngreso.reset();
    errorIngreso.textContent = '';
    const productos = Object.values(await getProductos());
    selectIngreso.innerHTML = productos.map(p => `<option value="${p.codigo}">${p.nombre} (${p.codigo})</option>`).join('');
    modalIngreso.abrir('Ingresar al inventario');
  });

  formularioIngreso.onsubmit = async (evento) => {
    evento.preventDefault();
    errorIngreso.textContent = '';
    const codigo = selectIngreso.value;
    const cantidad = Number(document.getElementById('ingreso-cantidad').value);
    const productos = await getProductos();
    if (!productos[codigo]) {
      errorIngreso.textContent = 'Producto no encontrado';
      return;
    }
    if (!cantidad || cantidad <= 0) {
      errorIngreso.textContent = 'Ingresa una cantidad valida';
      return;
    }
    const producto = productos[codigo];
    producto.stock += cantidad;
    await guardarProducto(producto);
    toast.mostrar('Stock actualizado correctamente');
    modalIngreso.cerrar();
    actualizarTabla(contenedor.querySelector('#buscador-productos').value);
  };
}
