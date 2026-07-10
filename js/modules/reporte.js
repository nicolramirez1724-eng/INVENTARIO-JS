const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function obtenerAnioMesProduccion(registro) {
  const valor = registro.fecha;
  if (!valor) return null;

  const coincidenciaIso = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (coincidenciaIso) {
    return { anio: coincidenciaIso[1], mes: coincidenciaIso[2], dia: coincidenciaIso[3] };
  }

  const coincidenciaAntigua = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(valor);
  if (coincidenciaAntigua) {
    return {
      anio: coincidenciaAntigua[3],
      mes: coincidenciaAntigua[2].padStart(2, '0'),
      dia: coincidenciaAntigua[1].padStart(2, '0')
    };
  }

  return null;
}

async function renderReporte(contenedor) {
  contenedor.innerHTML = `
    <div class="encabezado-seccion">
      <h2>Reporte de materia prima</h2>
    </div>
    <div class="tarjeta">
      <h3>Materia prima utilizada en un mes</h3>
      <div class="formulario-grid">
        <div class="campo">
          <label for="reporte-anio">Año</label>
          <input type="number" id="reporte-anio" step="1">
        </div>
        <div class="campo">
          <label for="reporte-mes">Mes</label>
          <select id="reporte-mes"></select>
        </div>
      </div>
      <div class="error-campo" id="reporte-error"></div>
      <div class="acciones-formulario">
        <button type="button" id="boton-generar-reporte" class="boton boton-primario">Generar reporte</button>
      </div>
    </div>
    <div class="tarjeta">
      <h3>Materia prima consumida</h3>
      <p class="subtitulo" id="reporte-periodo"></p>
      <data-table id="tabla-reporte"></data-table>
    </div>
  `;

  const selectAnio = contenedor.querySelector('#reporte-anio');
  const selectMes = contenedor.querySelector('#reporte-mes');
  const errorEl = contenedor.querySelector('#reporte-error');
  const tabla = contenedor.querySelector('#tabla-reporte');
  const periodoEl = contenedor.querySelector('#reporte-periodo');

  tabla.idClave = 'codigo';
  tabla.conAcciones = false;
  tabla.columnas = [
    { clave: 'codigo', etiqueta: 'Codigo' },
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'cantidad', etiqueta: 'Cantidad consumida' },
    { clave: 'fecha', etiqueta: 'Fecha' }
  ];
  tabla.filas = [];

  const producciones = await getProducciones();

  const anioActual = new Date().getFullYear();
  selectAnio.value = anioActual;
  selectMes.innerHTML = NOMBRES_MESES.map((nombre, indice) => {
    const valor = String(indice + 1).padStart(2, '0');
    const seleccionado = indice + 1 === new Date().getMonth() + 1 ? 'selected' : '';
    return `<option value="${valor}" ${seleccionado}>${nombre}</option>`;
  }).join('');

  async function generarReporte() {
    errorEl.textContent = '';
    const anio = selectAnio.value;
    const mes = selectMes.value;

    if (!anio || !mes || !/^\d{4}$/.test(anio)) {
      errorEl.textContent = 'Ingresa un año valido (4 digitos) y selecciona un mes';
      periodoEl.textContent = '';
      return;
    }

    const nombreMes = NOMBRES_MESES[Number(mes) - 1];
    periodoEl.textContent = `Periodo consultado: ${nombreMes} de ${anio}`;

    const prefijo = `${anio}-${mes}`;
    const produccionesDelMes = producciones.filter(p => {
      const anioMes = obtenerAnioMesProduccion(p);
      return anioMes && `${anioMes.anio}-${anioMes.mes}` === prefijo;
    });

    const consumoPorCodigo = {};
    produccionesDelMes.forEach(p => {
      const anioMes = obtenerAnioMesProduccion(p);
      const fechaIsoOrdenable = anioMes ? `${anioMes.anio}-${anioMes.mes}-${anioMes.dia}` : null;
      (p.materiaPrimaUsada || []).forEach(item => {
        if (!consumoPorCodigo[item.codigo]) {
          consumoPorCodigo[item.codigo] = { cantidad: 0, fechas: new Set() };
        }
        consumoPorCodigo[item.codigo].cantidad += item.cantidad;
        if (fechaIsoOrdenable) consumoPorCodigo[item.codigo].fechas.add(fechaIsoOrdenable);
      });
    });

    const productos = await getProductos();
    const filas = Object.entries(consumoPorCodigo).map(([codigo, datos]) => {
      const fechasOrdenadas = Array.from(datos.fechas).sort();
      const aFechaCorta = (iso) => {
        const [anioF, mesF, diaF] = iso.split('-');
        return `${diaF}/${mesF}/${anioF}`;
      };
      const fecha = fechasOrdenadas.length === 0
        ? ''
        : fechasOrdenadas.length === 1
          ? aFechaCorta(fechasOrdenadas[0])
          : `${aFechaCorta(fechasOrdenadas[0])} - ${aFechaCorta(fechasOrdenadas[fechasOrdenadas.length - 1])}`;
      return {
        codigo,
        nombre: productos[codigo] ? productos[codigo].nombre : codigo,
        cantidad: datos.cantidad,
        fecha
      };
    });

    tabla.filas = filas;

    if (filas.length === 0) {
      errorEl.textContent = 'No hay consumo de materia prima registrado para ese periodo';
    }
  }

  contenedor.querySelector('#boton-generar-reporte').addEventListener('click', generarReporte);

  generarReporte();
}
