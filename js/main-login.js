const botonIngresar = document.querySelector('#formulario-login button[type="submit"]');
botonIngresar.disabled = true;
botonIngresar.textContent = 'Cargando datos...';

sembrarDatosIniciales()
  .then(() => {
    botonIngresar.disabled = false;
    botonIngresar.textContent = 'Ingresar';
  })
  .catch((error) => {
    console.error('Error al preparar los datos iniciales', error);
    botonIngresar.disabled = false;
    botonIngresar.textContent = 'Ingresar';
  });

document.getElementById('formulario-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  const identificacion = document.getElementById('login-identificacion').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!identificacion || !password) {
    errorEl.textContent = 'Completa todos los campos';
    return;
  }

  try {
    await iniciarSesion(identificacion, password);
    window.location.href = 'app.html';
  } catch (error) {
    errorEl.textContent = error.message;
  }
});
