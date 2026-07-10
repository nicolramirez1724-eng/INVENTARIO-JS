async function renderProduccion(contenedor) {
  contenedor.innerHTML = `
    <div class="encabezado-seccion">
      <h2>Produccion</h2>
    </div>
    <div class="tarjeta">
      <h3>Generar proceso de produccion</h3>
      <div class="formulario-grid">
        <div class="campo">
          <label for="produccion-producto">Producto terminado</label>
          <select id="produccion-producto"></select>
        </div>
        <div class="campo">
          <label for="produccion-cantidad">Cantidad a fabricar</label>
          <input type="number" id="produccion-cantidad" min="1" step="1">
        </div>
      </div>
      <div class="error-campo" id="produccion-error"></div>
      <div class="acciones-formulario">
        <button type="button" id="boton-generar-produccion" class="boton boton-primario">Generar produccion</button>
      </div>
    </div>
    <div class="tarjeta">
      <h3>Historial de produccion</h3>
      <data-table id="tabla-historial-produccion"></data-table>
    </div>
  `;

  function normalizarReceta(receta) {
    if (!receta) return null;
    if (Array.isArray(receta)) {
      return receta.filter(item => item && item.codigo);
    }
    return Object.entries(receta).map(([codigo, cantidad]) => ({ codigo, cantidad }));
  }

  const selectProducto = contenedor.querySelector('#produccion-producto');
  const inputCantidad = contenedor.querySelector('#produccion-cantidad');
  const errorEl = contenedor.querySelector('#produccion-error');
  const toast = document.querySelector('app-toast');
  const modalResumen = document.getElementById('modal-resumen-produccion');
  const contenidoResumen = document.getElementById('contenido-resumen-produccion');
  const tablaHistorial = contenedor.querySelector('#tabla-historial-produccion');

  tablaHistorial.idClave = 'id';
  tablaHistorial.conAcciones = false;
  tablaHistorial.columnas = [
    { clave: 'id', etiqueta: 'Consecutivo' },
    { clave: 'fechaHora', etiqueta: 'Fecha', formatear: (valor, fila) => valor || fila.fecha },
    { clave: 'codigo', etiqueta: 'Producto', formatear: (codigo, fila) => fila.nombreProducto || codigo },
    { clave: 'cantidad', etiqueta: 'Cantidad fabricada' }
  ];

  async function cargarHistorial() {
    const [producciones, productos] = await Promise.all([getProducciones(), getProductos()]);
    const filas = producciones
      .map(p => ({ ...p, nombreProducto: productos[p.codigo] ? productos[p.codigo].nombre : p.codigo }))
      .sort((a, b) => b.id - a.id);
    tablaHistorial.filas = filas;
  }

  async function cargarProductosFabricables() {
    const productos = Object.values(await getProductos()).filter(p => p.receta);
    selectProducto.innerHTML = productos.map(p => `<option value="${p.codigo}">${p.nombre} (${p.codigo})</option>`).join('');
  }

  function mostrarResumen(produccion, productos) {
    const producto = productos[produccion.codigo];
    const materiales = produccion.materiaPrimaUsada.map(m => {
      const materia = productos[m.codigo];
      return `<li>${materia ? materia.nombre : m.codigo}: ${m.cantidad}</li>`;
    }).join('');
    contenidoResumen.innerHTML = `
      <p class="subtitulo">Proceso consecutivo #${produccion.id} - ${produccion.fechaHora || produccion.fecha}</p>
      <div class="resumen-produccion">
        <h4>${producto ? producto.nombre : produccion.codigo} - Cantidad fabricada: ${produccion.cantidad}</h4>
        <ul>${materiales}</ul>
      </div>
    `;
    modalResumen.abrir('Resumen de produccion');
  }

  contenedor.querySelector('#boton-generar-produccion').addEventListener('click', async () => {
    errorEl.textContent = '';
    const codigo = selectProducto.value;
    const cantidad = Number(inputCantidad.value);

    if (!codigo) {
      errorEl.textContent = 'Selecciona un producto';
      return;
    }
    if (!cantidad || cantidad <= 0) {
      errorEl.textContent = 'Ingresa una cantidad valida';
      return;
    }

    const productos = await getProductos();
    const producto = productos[codigo];
    const receta = producto ? normalizarReceta(producto.receta) : null;

    if (!producto || !receta) {
      errorEl.textContent = 'El producto seleccionado no tiene una formula valida';
      return;
    }

    for (const item of receta) {
      const requerido = item.cantidad * cantidad;
      const materia = productos[item.codigo];
      if (!materia || materia.stock < requerido) {
        errorEl.textContent = `Stock insuficiente de ${materia ? materia.nombre : item.codigo}`;
        return;
      }
    }

    const materiaPrimaUsada = [];
    for (const item of receta) {
      const cantidadUsada = item.cantidad * cantidad;
      const materia = productos[item.codigo];
      materia.stock -= cantidadUsada;
      await guardarProducto(materia);
      materiaPrimaUsada.push({ codigo: item.codigo, cantidad: cantidadUsada });
    }

    producto.stock += cantidad;
    await guardarProducto(producto);

    const ahora = new Date();
    const fechaISO = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

    const registro = {
      id: await siguienteConsecutivo(),
      fecha: fechaISO,
      fechaHora: ahora.toLocaleString('es-CO'),
      codigo,
      cantidad,
      materiaPrimaUsada
    };
    await guardarProduccion(registro);

    toast.mostrar('Produccion generada correctamente');
    inputCantidad.value = '';
    cargarProductosFabricables();
    cargarHistorial();
    mostrarResumen(registro, productos);
  });

  cargarProductosFabricables();
  cargarHistorial();
}
