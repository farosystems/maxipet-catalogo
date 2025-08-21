-- Script para agregar filtro que excluya productos con precio 0
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar cuántos productos tienen precio 0
SELECT 'PRODUCTOS CON PRECIO 0 (que serán excluidos):' as info;
SELECT COUNT(*) as productos_precio_0 FROM productos WHERE precio = 0;

-- 2. Lista de productos con precio 0 que serán excluidos
SELECT 'LISTA DE PRODUCTOS CON PRECIO 0:' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca,
    destacado
FROM productos 
WHERE precio = 0
ORDER BY descripcion;

-- 3. Verificar cuántos productos quedarán después del filtro
SELECT 'PRODUCTOS QUE SE MOSTRARÁN (precio > 0):' as info;
SELECT COUNT(*) as productos_a_mostrar FROM productos WHERE precio > 0;

-- 4. Crear una vista que excluya productos con precio 0 (opcional)
-- Esta vista se puede usar en lugar de la tabla productos directamente
CREATE OR REPLACE VIEW productos_activos AS
SELECT * FROM productos WHERE precio > 0;

-- 5. Verificar la vista creada
SELECT 'VERIFICANDO VISTA productos_activos:' as info;
SELECT COUNT(*) as total_en_vista FROM productos_activos;

-- 6. Comparación final
SELECT 'COMPARACIÓN FINAL:' as info;
SELECT 
    (SELECT COUNT(*) FROM productos) as total_productos,
    (SELECT COUNT(*) FROM productos WHERE precio = 0) as productos_precio_0,
    (SELECT COUNT(*) FROM productos WHERE precio > 0) as productos_a_mostrar,
    (SELECT COUNT(*) FROM productos_activos) as productos_en_vista;
