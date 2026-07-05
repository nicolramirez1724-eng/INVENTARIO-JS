# Acme Produccion - Planta Macondo

Aplicacion web para automatizar el proceso de produccion de la planta de Acme en Macondo. Permite gestionar usuarios, inventario de materia prima y productos terminados, y el proceso productivo con control de formulas y consecutivos.

## Tecnologias

- HTML5
- CSS3 (responsive, variables CSS)
- JavaScript (ES6+, Web Components nativos)
- Firebase Realtime Database (base de datos en la nube, mediante la API REST con `fetch`)

No requiere frameworks, ni SDK, ni instalacion de dependencias. Toda la comunicacion con Firebase se hace con `fetch` normal, igual que a cualquier otra API.

## Configuracion de Firebase ya usada en este proyecto

Este proyecto ya esta conectado a la base de datos:

```
https://stock-flow-55dd7-default-rtdb.firebaseio.com
```

Esa direccion esta definida en `js/storage.js` en la constante `BASE_URL`. Si en algun momento se crea otra base de datos, solo hay que cambiar esa constante por la nueva URL.

Las reglas de la base de datos deben permitir lectura y escritura. En la consola de Firebase, en Realtime Database > Reglas, deben verse asi:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Estas reglas son abiertas y solo son validas para uso academico, no para produccion.

## Como ejecutar el proyecto

1. Clonar o descargar este repositorio.
2. Abrir la carpeta del proyecto con un servidor local. Por ejemplo, con la extension "Live Server" de VS Code, o ejecutando en la terminal dentro de la carpeta:

```
npx serve .
```

3. Abrir en el navegador la URL indicada (ejemplo `http://localhost:3000`) y navegar a `index.html`.

## Primer uso

La aplicacion crea automaticamente en Firebase un usuario administrador la primera vez que se ejecuta:

- Identificacion: `admin`
- Contrasena: `admin123`

Con esas credenciales se ingresa a la aplicacion y desde el modulo de Usuarios se pueden crear, editar o eliminar los demas usuarios del sistema.

El inventario tambien se precarga automaticamente con datos de ejemplo (harina, mantequilla, huevo y una galleta de chocolate con su formula) para facilitar las pruebas del modulo de produccion.

## Estructura del proyecto

```
index.html              Login
app.html                Aplicacion principal (inventario, produccion, usuarios)
css/
  reset.css             Reinicio de estilos base
  variables.css          Variables de color, espaciado y tipografia
  style.css              Estilos de toda la aplicacion, responsive
js/
  storage.js             Acceso a Firebase Realtime Database (usuarios, productos, producciones, consecutivo)
  crypto.js               Hash de contrasenas con SubtleCrypto (SHA-256)
  auth.js                  Login, logout y control de sesion
  main-login.js           Logica de la pantalla de login
  main-app.js              Orquestacion de navegacion entre modulos
  components/
    app-header.js          Encabezado con navegacion y datos del usuario
    app-modal.js            Modal generico reutilizable
    confirm-dialog.js       Dialogo de confirmacion reutilizable
    app-toast.js             Notificaciones tipo toast
    data-table.js            Tabla de datos generica y reutilizable con acciones
  modules/
    usuarios.js              Modulo de usuarios (crear, editar, eliminar)
    inventario.js            Modulo de inventario (productos, formulas, ingreso de stock)
    produccion.js            Modulo de produccion (fabricacion, consecutivo, resumen)
```

## Modelo de datos (Firebase Realtime Database)

**Nodo `usuarios`** (la clave de cada usuario es su identificacion)
```json
{
  "usuarios": {
    "123": { "identificacion": "123", "nombre": "Camila Salazar", "cargo": "Operaria", "passwordHash": "..." }
  }
}
```

**Nodo `productos`** (la clave de cada producto es su codigo)
```json
{
  "productos": {
    "COD_001": {
      "codigo": "COD_001",
      "nombre": "Galleta Chocolate",
      "proveedor": "Acme Corp",
      "stock": 50,
      "receta": { "HARINA": 100, "MANTEQUILLA": 100, "HUEVO": 1 }
    }
  }
}
```

Si `receta` es `null`, el producto es materia prima. Si tiene un objeto con codigos de materia prima y cantidades, es un producto fabricado.

**Nodo `producciones`** (la clave de cada proceso es su consecutivo)
```json
{
  "producciones": {
    "1": {
      "id": 1,
      "fecha": "01/07/2026, 10:00:00 a. m.",
      "codigo": "COD_001",
      "cantidad": 10,
      "materiaPrimaUsada": [
        { "codigo": "HARINA", "cantidad": 1000 },
        { "codigo": "MANTEQUILLA", "cantidad": 1000 },
        { "codigo": "HUEVO", "cantidad": 10 }
      ]
    }
  }
}
```

**Nodo `configuracion/consecutivo`**: numero entero que se incrementa con cada proceso de produccion generado, iniciando en 1.

## Funcionalidades por modulo

### Login
Autenticacion por numero de identificacion y contrasena. Los usuarios se crean desde el modulo de Usuarios, no hay registro publico.

### Usuarios
Crear, modificar y eliminar usuarios registrados. La creacion y edicion solicitan contrasena dos veces para evitar errores de digitacion. Incluye buscador por nombre, identificacion o cargo.

### Inventario
Listado de productos con buscador por codigo, nombre o proveedor, mostrando el saldo disponible. Permite crear productos indicando codigo, nombre y proveedor, y opcionalmente definir una formula (materia prima y cantidades requeridas) si el producto es fabricado. Permite ingresar cantidades al inventario buscando el producto por su codigo.

### Produccion
Permite seleccionar un producto terminado y la cantidad a fabricar. Antes de confirmar, valida que exista suficiente materia prima disponible segun la formula del producto. Al generar la produccion, descuenta la materia prima usada, aumenta el stock del producto fabricado, asigna un codigo consecutivo al proceso y muestra un resumen con la cantidad fabricada y la materia prima usada.

## Buenas practicas aplicadas

- Componentes web nativos (Custom Elements con eventos personalizados y metodos publicos) para reutilizar modal, tabla, dialogo de confirmacion y notificaciones en los tres modulos.
- Separacion de responsabilidades entre acceso a datos (storage.js), autenticacion (auth.js), componentes visuales reutilizables y logica de cada modulo.
- Validaciones de formulario en cliente y control de sesion antes de acceder a la aplicacion principal.
- Diseno responsive con CSS Grid y Flexbox, adaptado a dispositivos moviles.
- La sesion del usuario logueado se guarda en localStorage solo para no perderla al recargar la pagina; toda la informacion del negocio (usuarios, inventario, producciones) vive en Firebase.
