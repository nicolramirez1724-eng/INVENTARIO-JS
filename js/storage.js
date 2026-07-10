const BASE_URL = 'https://stock-flow-55dd7-default-rtdb.firebaseio.com';

async function getUsuarios() {
  const respuesta = await fetch(`${BASE_URL}/usuarios.json`);
  const datos = await respuesta.json();
  return datos ? Object.values(datos) : [];
}

async function guardarUsuario(usuario) {
  const respuesta = await fetch(`${BASE_URL}/usuarios/${usuario.identificacion}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario)
  });
  if (!respuesta.ok) {
    console.error('Error al guardar usuario', usuario.identificacion, respuesta.status);
  }
}

async function eliminarUsuarioDB(identificacion) {
  await fetch(`${BASE_URL}/usuarios/${identificacion}.json`, {
    method: 'DELETE'
  });
}

async function getProductos() {
  const respuesta = await fetch(`${BASE_URL}/productos.json`);
  const datos = await respuesta.json();
  return datos || {};
}

async function guardarProducto(producto) {
  const respuesta = await fetch(`${BASE_URL}/productos/${producto.codigo}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto)
  });
  if (!respuesta.ok) {
    console.error('Error al guardar producto', producto.codigo, respuesta.status);
  }
}

async function eliminarProductoDB(codigo) {
  await fetch(`${BASE_URL}/productos/${codigo}.json`, {
    method: 'DELETE'
  });
}

async function getProducciones() {
  const respuesta = await fetch(`${BASE_URL}/producciones.json`);
  const datos = await respuesta.json();
  return datos ? Object.values(datos).filter(p => p && p.codigo) : [];
}

async function guardarProduccion(registro) {
  const respuesta = await fetch(`${BASE_URL}/producciones/${registro.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registro)
  });
  if (!respuesta.ok) {
    console.error('Error al guardar produccion', registro.id, respuesta.status);
  }
}

async function siguienteConsecutivo() {
  const respuesta = await fetch(`${BASE_URL}/configuracion/consecutivo.json`);
  const actual = await respuesta.json();
  const siguiente = (actual || 0) + 1;
  await fetch(`${BASE_URL}/configuracion/consecutivo.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(siguiente)
  });
  return siguiente;
}

function getSesion() {
  const dato = localStorage.getItem('acme_sesion');
  return dato ? JSON.parse(dato) : null;
}

function guardarSesion(sesion) {
  localStorage.setItem('acme_sesion', JSON.stringify(sesion));
}

function limpiarSesion() {
  localStorage.removeItem('acme_sesion');
}

async function sembrarDatosIniciales() {
  const productos = await getProductos();
  if (Object.keys(productos).length === 0) {
    const productosIniciales = [
      { codigo: 'HARINA', nombre: 'Harina', proveedor: 'Molinos Macondo', stock: 5000, receta: null },
      { codigo: 'MANTEQUILLA', nombre: 'Mantequilla', proveedor: 'Lacteos del Valle', stock: 3000, receta: null },
      { codigo: 'HUEVO', nombre: 'Huevo', proveedor: 'Granja San Jose', stock: 200, receta: null },
      {
        codigo: 'COD_001',
        nombre: 'Galleta Chocolate',
        proveedor: 'Acme Corp',
        stock: 50,
        receta: [
          { codigo: 'HARINA', cantidad: 100 },
          { codigo: 'MANTEQUILLA', cantidad: 100 },
          { codigo: 'HUEVO', cantidad: 1 }
        ]
      }
    ];
    for (const producto of productosIniciales) {
      await guardarProducto(producto);
    }
  }

  const usuarios = await getUsuarios();
  if (usuarios.length === 0) {
    const passwordHash = await hashTexto('admin123');
    await guardarUsuario({ identificacion: 'admin', nombre: 'Administrador Acme', cargo: 'Administrador', passwordHash });
  }
}
