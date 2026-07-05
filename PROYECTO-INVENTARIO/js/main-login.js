sembrarDatosIniciales();

document.getElementById('formulario-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  const identificacion = document.getElementById('login-identificacion').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await iniciarSesion(identificacion, password);
    window.location.href = 'app.html';
  } catch (error) {
    errorEl.textContent = error.message;
  }
});
