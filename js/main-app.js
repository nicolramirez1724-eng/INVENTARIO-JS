async function iniciar() {
  const sesion = requerirSesion();
  if (!sesion) return;

  await sembrarDatosIniciales();

  const header = document.getElementById('header-app');
  const contenido = document.getElementById('contenido-app');

  const renderizadores = {
    usuarios: renderUsuarios,
    inventario: renderInventario,
    produccion: renderProduccion
  };

  function irASeccion(seccion) {
    header.setAttribute('nombre', sesion.nombre);
    header.setAttribute('cargo', sesion.cargo);
    header.setAttribute('seccion', seccion);
    renderizadores[seccion](contenido);
  }

  header.addEventListener('cambiar-seccion', (evento) => irASeccion(evento.detail.seccion));
  header.addEventListener('cerrar-sesion', () => cerrarSesion());

  irASeccion('inventario');
}

iniciar();
