-- ===============================================
-- SCHEMA POSTGRESQL PARA VIVEROS
-- Ejecuta este script en tu base de datos PostgreSQL
-- ===============================================

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  id_categoria INT NULL,
  id_proveedor INT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(150),
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'empleado',
  estado SMALLINT DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(150),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) DEFAULT 0,
  id_usuario INT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- Crear tabla de detalles de venta
CREATE TABLE IF NOT EXISTS detalle_venta (
  id SERIAL PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (id_venta) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
);

-- Crear tabla de entradas de mercancía
CREATE TABLE IF NOT EXISTS entradas (
  id SERIAL PRIMARY KEY,
  id_proveedor INT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);

-- Crear tabla de detalles de entrada
CREATE TABLE IF NOT EXISTS detalle_entrada (
  id SERIAL PRIMARY KEY,
  id_entrada INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (id_entrada) REFERENCES entradas(id) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
);

-- ===============================================
-- DATOS INICIALES
-- ===============================================

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion) VALUES 
  ('Rosas', 'Variedades de rosas premium'),
  ('Lirios', 'Lirios y plantas similares'),
  ('Peonías', 'Peonías de diferentes colores'),
  ('Flores Silvestres', 'Flores silvestres y exóticas'),
  ('Plantas Verdes', 'Plantas de interior y exterior')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria) VALUES
  ('Rosa Roja Premium', 'Rosa roja de alta calidad', 25.00, 50, 1),
  ('Rosa Blanca', 'Rosa blanca para bodas', 20.00, 35, 1),
  ('Lirio Blanco', 'Lirio blanco puro', 30.00, 25, 2),
  ('Peonía Rosa', 'Peonía rosa claro', 35.00, 20, 3),
  ('Orquídea', 'Orquídea exótica', 40.00, 15, 5),
  ('Jazmín Nocturno', 'Jazmín de noche', 18.00, 30, 4),
  ('Margarita Gigante', 'Margarita amarilla grande', 12.00, 60, 4),
  ('Tulipán Holandés', 'Tulipán rojo importado', 22.00, 40, 1),
  ('Loto Acuático', 'Loto para estanques', 50.00, 10, 5),
  ('Clavel Español', 'Clavel rojo intenso', 15.00, 45, 4)
ON CONFLICT DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta ON detalle_venta(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalle_entrada_entrada ON detalle_entrada(id_entrada);

-- ===============================================
-- VERIFICACIÓN
-- ===============================================
SELECT 
  'Categorías' as tabla,
  COUNT(*) as total
FROM categorias
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Ventas', COUNT(*) FROM ventas;

-- FIN DEL SCRIPT