// Versión de los datos de ejemplo. Si la subes, la app agrega (sin borrar nada) los datos nuevos
// que le falten al navegador, así no tienes que limpiar el localStorage a mano.
export const SEED_VERSION = 3;

export const initialEstablishments = [
  {
    id: 'est-1',
    codigo: 'GS-DEMO',
    nombre: 'Restaurante Sabor & Tradición',
    direccion: 'Calle 10 # 5-20, Cúcuta',
    nit: '900123456-1',
    telefono: '+57 3101234567',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
    estado: 'activo',
    habeasDataAcceptedAt: '2026-10-01T08:30:00Z',
  },
  {
    id: 'est-2',
    codigo: 'GS-CENTRO',
    nombre: 'Pizzería Don Gino',
    direccion: 'Avenida 5 # 9-30, Centro, Cúcuta',
    nit: '901987654-3',
    telefono: '+57 3159876543',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
    estado: 'activo',
    habeasDataAcceptedAt: '2026-11-01T09:00:00Z',
  },
];

export const initialUsers = [
  // --- Local 1: GS-DEMO ---
  { id: 'u-1', nombreCompleto: 'Carlos Andrés Pérez Rojas', telefono: '3101112233', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'gerente', contrasenaHash: 'demo123', correo: 'gerente@gastrosync.com', rol: 'Gerente', cambioContrasenaObligatorio: false },
  { id: 'u-2', nombreCompleto: 'María Fernanda Gómez', telefono: '3102223344', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'mesero1', contrasenaHash: 'demo123', correo: 'mesero@gastrosync.com', rol: 'Mesero', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-3', nombreCompleto: 'Luis Eduardo Ramírez', telefono: '3103334455', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'cocina1', contrasenaHash: 'demo123', correo: 'cocina@gastrosync.com', rol: 'Cocina', salario: 1500000, cambioContrasenaObligatorio: false },
  { id: 'u-4', nombreCompleto: 'Jhon Alexander Duarte', telefono: '3104445566', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'domi1', contrasenaHash: 'demo123', correo: 'domi@gastrosync.com', rol: 'Domiciliario', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-5', nombreCompleto: 'Laura Sofía Mantilla', telefono: '3105556677', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'callcenter1', contrasenaHash: 'demo123', correo: 'call@gastrosync.com', rol: 'CallCenter', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-6', nombreCompleto: 'Andrés Felipe Cáceres', telefono: '3106667788', codigoEstablecimiento: 'GS-DEMO', nombreUsuario: 'mesero2', contrasenaHash: 'demo123', correo: 'mesero2@gastrosync.com', rol: 'Mesero', salario: 1300000, cambioContrasenaObligatorio: false },

  // --- Local 2: GS-CENTRO (mismos nombres de usuario a propósito, para probar que los locales no se mezclan) ---
  { id: 'u-21', nombreCompleto: 'Gino Antonio Rossi', telefono: '3151112233', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'gerente', contrasenaHash: 'demo123', correo: 'gerente@dongino.com', rol: 'Gerente', cambioContrasenaObligatorio: false },
  { id: 'u-22', nombreCompleto: 'Valentina Ortiz Silva', telefono: '3152223344', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'mesero1', contrasenaHash: 'demo123', correo: 'mesero@dongino.com', rol: 'Mesero', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-23', nombreCompleto: 'Camilo José Navarro', telefono: '3153334455', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'cocina1', contrasenaHash: 'demo123', correo: 'cocina@dongino.com', rol: 'Cocina', salario: 1500000, cambioContrasenaObligatorio: false },
  { id: 'u-24', nombreCompleto: 'Brayan Stiven Rangel', telefono: '3154445566', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'domi1', contrasenaHash: 'demo123', correo: 'domi@dongino.com', rol: 'Domiciliario', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-25', nombreCompleto: 'Daniela Carolina Peña', telefono: '3155556677', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'callcenter1', contrasenaHash: 'demo123', correo: 'call@dongino.com', rol: 'CallCenter', salario: 1300000, cambioContrasenaObligatorio: false },
  { id: 'u-26', nombreCompleto: 'Sebastián Leal Contreras', telefono: '3156667788', codigoEstablecimiento: 'GS-CENTRO', nombreUsuario: 'mesero2', contrasenaHash: 'demo123', correo: 'mesero2@dongino.com', rol: 'Mesero', salario: 1300000, cambioContrasenaObligatorio: false },
];

export const initialProducts = [
  { id: 'p-1', codigoEstablecimiento: 'GS-DEMO', categoria: 'Platos Fuertes', nombre: 'Bandeja Paisa Tradicional', descripcion: 'Frijoles, arroz, carne molida, chicharrón, chorizo, huevo, plátano y arepa.', precio: 28000, disponible: true, imagen: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500' },
  { id: 'p-2', codigoEstablecimiento: 'GS-DEMO', categoria: 'Platos Fuertes', nombre: 'Sobrebarriga a la Criolla', descripcion: 'Tierna sobrebarriga en salsa criolla con yuca y papa cocida.', precio: 32000, disponible: true, imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' },
  { id: 'p-3', codigoEstablecimiento: 'GS-DEMO', categoria: 'Bebidas', nombre: 'Limonada de Panela con Hierbabuena', descripcion: 'Refrescante limonada natural con toque de panela y hierbabuena.', precio: 6000, disponible: true, imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
  { id: 'p-4', codigoEstablecimiento: 'GS-DEMO', categoria: 'Entradas', nombre: 'Empanadas Criollas (3 unid)', descripcion: 'Empanadas de maíz rellenas de carne y papa con ají casero.', precio: 9000, disponible: true, imagen: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500' },

  { id: 'p-21', codigoEstablecimiento: 'GS-CENTRO', categoria: 'Pizzas', nombre: 'Pizza Margarita', descripcion: 'Salsa de tomate, mozzarella y albahaca fresca.', precio: 32000, disponible: true, imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
  { id: 'p-22', codigoEstablecimiento: 'GS-CENTRO', categoria: 'Pizzas', nombre: 'Pizza Pepperoni', descripcion: 'Mozzarella y abundante pepperoni.', precio: 38000, disponible: true, imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
  { id: 'p-23', codigoEstablecimiento: 'GS-CENTRO', categoria: 'Pastas', nombre: 'Lasaña de Carne', descripcion: 'Capas de pasta, carne, bechamel y queso gratinado.', precio: 30000, disponible: true, imagen: '' },
  { id: 'p-24', codigoEstablecimiento: 'GS-CENTRO', categoria: 'Bebidas', nombre: 'Gaseosa 400 ml', descripcion: 'Gaseosa bien fría.', precio: 5000, disponible: true, imagen: '' },
  { id: 'p-25', codigoEstablecimiento: 'GS-CENTRO', categoria: 'Postres', nombre: 'Tiramisú', descripcion: 'Postre italiano con café y mascarpone.', precio: 12000, disponible: true, imagen: '' },
];

export const initialTables = [
  { id: 'm-1', codigoEstablecimiento: 'GS-DEMO', numero: 1, estado: 'libre' },
  { id: 'm-2', codigoEstablecimiento: 'GS-DEMO', numero: 2, estado: 'libre' },
  { id: 'm-3', codigoEstablecimiento: 'GS-DEMO', numero: 3, estado: 'ocupada' },
  { id: 'm-4', codigoEstablecimiento: 'GS-DEMO', numero: 4, estado: 'libre' },

  { id: 'm-GS-CENTRO-1', codigoEstablecimiento: 'GS-CENTRO', numero: 1, estado: 'libre' },
  { id: 'm-GS-CENTRO-2', codigoEstablecimiento: 'GS-CENTRO', numero: 2, estado: 'libre' },
  { id: 'm-GS-CENTRO-3', codigoEstablecimiento: 'GS-CENTRO', numero: 3, estado: 'libre' },
  { id: 'm-GS-CENTRO-4', codigoEstablecimiento: 'GS-CENTRO', numero: 4, estado: 'libre' },
];

export const initialPaymentConfig = [
  { id: 'pay-1', codigoEstablecimiento: 'GS-DEMO', tipo: 'efectivo', habilitado: true, cuentaBancariaCifrada: '' },
  { id: 'pay-2', codigoEstablecimiento: 'GS-DEMO', tipo: 'transferencia', habilitado: true, cuentaBancariaCifrada: 'Bancolombia Ahorros ***4589', qrImagen: '' },
  { id: 'pay-21', codigoEstablecimiento: 'GS-CENTRO', tipo: 'efectivo', habilitado: true, cuentaBancariaCifrada: '' },
  { id: 'pay-22', codigoEstablecimiento: 'GS-CENTRO', tipo: 'transferencia', habilitado: true, cuentaBancariaCifrada: 'Nequi 315 987 6543 - Pizzería Don Gino', qrImagen: '' },
];
