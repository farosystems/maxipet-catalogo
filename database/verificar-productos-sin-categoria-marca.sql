-- Script para verificar productos sin categoría o marca asignada
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar productos sin categoría asignada
SELECT 'PRODUCTOS SIN CATEGORÍA ASIGNADA:' as info;
SELECT COUNT(*) as sin_categoria FROM productos WHERE fk_id_categoria IS NULL;

-- 2. Verificar productos sin marca asignada
SELECT 'PRODUCTOS SIN MARCA ASIGNADA:' as info;
SELECT COUNT(*) as sin_marca FROM productos WHERE fk_id_marca IS NULL;

-- 3. Lista de productos sin categoría
SELECT 'LISTA DE PRODUCTOS SIN CATEGORÍA:' as info;
SELECT 
    id,
    descripcion,
    precio,
    fk_id_categoria,
    categoria,
    marca
FROM productos 
WHERE fk_id_categoria IS NULL
ORDER BY descripcion;

-- 4. Lista de productos sin marca
SELECT 'LISTA DE PRODUCTOS SIN MARCA:' as info;
SELECT 
    id,
    descripcion,
    precio,
    fk_id_categoria,
    categoria,
    fk_id_marca,
    marca
FROM productos 
WHERE fk_id_marca IS NULL
ORDER BY descripcion;

-- 5. Verificar productos que no aparecen en la consulta con JOIN
SELECT 'PRODUCTOS QUE NO APARECEN CON JOIN:' as info;
SELECT 
    p.id,
    p.descripcion,
    p.precio,
    p.fk_id_categoria,
    p.fk_id_marca,
    c.id as categoria_id,
    m.id as marca_id
FROM productos p
LEFT JOIN categoria c ON p.fk_id_categoria = c.id
LEFT JOIN marcas m ON p.fk_id_marca = m.id
WHERE c.id IS NULL OR m.id IS NULL
ORDER BY p.descripcion;

-- 6. Total de productos que deberían aparecer
SELECT 'TOTAL PRODUCTOS VÁLIDOS:' as info;
SELECT COUNT(*) as total_validos
FROM productos p
LEFT JOIN categoria c ON p.fk_id_categoria = c.id
LEFT JOIN marcas m ON p.fk_id_marca = m.id
WHERE c.id IS NOT NULL AND m.id IS NOT NULL;

-- 7. Comparación con total de productos
SELECT 'COMPARACIÓN:' as info;
SELECT 
    (SELECT COUNT(*) FROM productos) as total_productos,
    (SELECT COUNT(*) FROM productos WHERE precio > 0) as productos_precio_mayor_0,
    (SELECT COUNT(*) FROM productos p
     LEFT JOIN categoria c ON p.fk_id_categoria = c.id
     LEFT JOIN marcas m ON p.fk_id_marca = m.id
     WHERE c.id IS NOT NULL AND m.id IS NOT NULL) as productos_con_categoria_marca;
