Usuario de prueba: admin / admin123

Acme Producción - Planta Macondo
Sistema web que automatiza la producción de la planta Acme en Macondo.
¿Qué es?
Una aplicación donde:

Entras con usuario y contraseña (login).
Controlas el inventario: materia prima (harina, mantequilla, huevo) y productos terminados (galletas), cada uno con su cantidad disponible.
Generas producción: eliges qué fabricar y cuánto, y el sistema descuenta automáticamente la materia prima usada y aumenta el producto terminado, según una fórmula (receta) que tú defines.

Los 3 módulos

Usuarios: crear, editar, eliminar usuarios que pueden entrar al sistema.
Inventario: crear productos, definirles fórmula si se fabrican, ingresar stock, buscar por código/nombre/proveedor.
Producción: fabricar un producto (resta materia prima, suma producto terminado), con número consecutivo y resumen de lo fabricado.

Cómo funciona por dentro

HTML, CSS y JavaScript.
Web Components reutilizables (modal, tabla, notificaciones, confirmación).
Los datos se guardan en Firebase Realtime Database, en la nube.

