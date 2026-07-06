async function registrarUsuario({ identificacion, nombre, cargo, password }) {
  const usuarios = await getUsuarios();
  const existe = usuarios.some(u => u.identificacion === identificacion);
  if (existe) {
    throw new Error('Ya existe un usuario con esa identificacion');
  }
  const passwordHash = await hashTexto(password);
  await guardarUsuario({ identificacion, nombre, cargo, passwordHash });
}

async function actualizarUsuario(identificacionOriginal, { identificacion, nombre, cargo, password }) {
  const usuarios = await getUsuarios();
  const usuarioActual = usuarios.find(u => u.identificacion === identificacionOriginal);
  if (!usuarioActual) {
    throw new Error('Usuario no encontrado');
  }
  if (identificacion !== identificacionOriginal && usuarios.some(u => u.identificacion === identificacion)) {
    throw new Error('Ya existe un usuario con esa identificacion');
  }
  const passwordHash = password ? await hashTexto(password) : usuarioActual.passwordHash;
  if (identificacion !== identificacionOriginal) {
    await eliminarUsuarioDB(identificacionOriginal);
  }
  await guardarUsuario({ identificacion, nombre, cargo, passwordHash });
}

async function eliminarUsuario(identificacion) {
  await eliminarUsuarioDB(identificacion);
}

async function iniciarSesion(identificacion, password) {
  const usuarios = await getUsuarios();
  const usuario = usuarios.find(u => u.identificacion === identificacion);
  if (!usuario) {
    throw new Error('Identificacion o contrasena incorrecta');
  }
  const passwordHash = await hashTexto(password);
  if (passwordHash !== usuario.passwordHash) {
    throw new Error('Identificacion o contrasena incorrecta');
  }
  guardarSesion({ identificacion: usuario.identificacion, nombre: usuario.nombre, cargo: usuario.cargo });
  return usuario;
}

function cerrarSesion() {
  limpiarSesion();
  window.location.href = 'index.html';
}

function requerirSesion() {
  const sesion = getSesion();
  if (!sesion) {
    window.location.href = 'index.html';
    return null;
  }
  return sesion;
}
