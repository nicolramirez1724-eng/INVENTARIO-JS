async function renderUsuarios(contenedor) {
  contenedor.innerHTML = `
    <div class="encabezado-seccion">
      <h2>Usuarios</h2>
      <button id="boton-nuevo-usuario" class="boton boton-primario">Nuevo usuario</button>
    </div>
    <div class="barra-herramientas">
      <input type="text" id="buscador-usuarios" class="buscador" placeholder="Buscar por nombre, identificacion o cargo">
    </div>
    <div class="tarjeta">
      <data-table id="tabla-usuarios"></data-table>
    </div>
  `;

  const tabla = contenedor.querySelector('#tabla-usuarios');
  tabla.idClave = 'identificacion';
  tabla.conAcciones = true;
  tabla.columnas = [
    { clave: 'identificacion', etiqueta: 'Identificacion' },
    { clave: 'nombre', etiqueta: 'Nombre completo' },
    { clave: 'cargo', etiqueta: 'Cargo' }
  ];

  async function actualizarTabla(filtro = '') {
    const usuarios = await getUsuarios();
    tabla.filas = usuarios.filter(u =>
      u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      u.identificacion.toLowerCase().includes(filtro.toLowerCase()) ||
      u.cargo.toLowerCase().includes(filtro.toLowerCase())
    );
  }

  await actualizarTabla();

  contenedor.querySelector('#buscador-usuarios').addEventListener('input', (evento) => {
    actualizarTabla(evento.target.value);
  });

  const modal = document.getElementById('modal-usuario');
  const formulario = document.getElementById('formulario-usuario');
  const errorEl = document.getElementById('usuario-error');
  const toast = document.querySelector('app-toast');
  const dialogo = document.getElementById('dialogo-confirmar');

  contenedor.querySelector('#boton-nuevo-usuario').addEventListener('click', () => {
    formulario.reset();
    document.getElementById('usuario-identificacion-original').value = '';
    document.getElementById('usuario-password').required = true;
    document.getElementById('usuario-password-confirmar').required = true;
    errorEl.textContent = '';
    modal.abrir('Nuevo usuario');
  });

  tabla.addEventListener('editar-fila', async (evento) => {
    const usuarios = await getUsuarios();
    const usuario = usuarios.find(u => u.identificacion === evento.detail.id);
    if (!usuario) return;
    formulario.reset();
    document.getElementById('usuario-identificacion-original').value = usuario.identificacion;
    document.getElementById('usuario-identificacion').value = usuario.identificacion;
    document.getElementById('usuario-nombre').value = usuario.nombre;
    document.getElementById('usuario-cargo').value = usuario.cargo;
    document.getElementById('usuario-password').required = false;
    document.getElementById('usuario-password-confirmar').required = false;
    errorEl.textContent = '';
    modal.abrir('Editar usuario');
  });

  tabla.addEventListener('eliminar-fila', async (evento) => {
    const confirmado = await dialogo.preguntar('Deseas eliminar este usuario?');
    if (!confirmado) return;
    await eliminarUsuario(evento.detail.id);
    toast.mostrar('Usuario eliminado');
    actualizarTabla(contenedor.querySelector('#buscador-usuarios').value);
  });

  formulario.onsubmit = async (evento) => {
    evento.preventDefault();
    errorEl.textContent = '';
    const identificacionOriginal = document.getElementById('usuario-identificacion-original').value;
    const identificacion = document.getElementById('usuario-identificacion').value.trim();
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const cargo = document.getElementById('usuario-cargo').value.trim();
    const password = document.getElementById('usuario-password').value;
    const passwordConfirmar = document.getElementById('usuario-password-confirmar').value;

    if (!identificacion || !nombre || !cargo) {
      errorEl.textContent = 'Completa todos los campos';
      return;
    }

    if (password || passwordConfirmar) {
      if (!password.trim()) {
        errorEl.textContent = 'La contrasena no puede estar vacia ni tener solo espacios';
        return;
      }
      if (password !== passwordConfirmar) {
        errorEl.textContent = 'Las contrasenas no coinciden';
        return;
      }
    }

    try {
      if (identificacionOriginal) {
        await actualizarUsuario(identificacionOriginal, { identificacion, nombre, cargo, password });
        toast.mostrar('Usuario actualizado');
      } else {
        if (!password) {
          errorEl.textContent = 'La contrasena es obligatoria';
          return;
        }
        await registrarUsuario({ identificacion, nombre, cargo, password });
        toast.mostrar('Usuario creado');
      }
      modal.cerrar();
      actualizarTabla(contenedor.querySelector('#buscador-usuarios').value);
    } catch (error) {
      errorEl.textContent = error.message;
    }
  };
}
