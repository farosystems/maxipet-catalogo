-- Script para debuggear productos específicos que no aparecen en la búsqueda
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla productos
SELECT 'ESTRUCTURA DE LA TABLA PRODUCTOS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- 2. Verificar si hay productos con campos NULL o vacíos que puedan causar problemas
SELECT 'PRODUCTOS CON CAMPOS PROBLEMÁTICOS:' as info;
SELECT 
    id,
    descripcion,
    precio,
    fk_id_categoria,
    fk_id_marca,
    categoria,
    marca,
    destacado,
    CASE 
        WHEN descripcion IS NULL OR descripcion = '' THEN 'Descripción vacía'
        WHEN fk_id_categoria IS NULL THEN 'Sin categoría'
        WHEN fk_id_marca IS NULL THEN 'Sin marca'
        WHEN categoria IS NULL OR categoria = '' THEN 'Campo categoria vacío'
        WHEN marca IS NULL OR marca = '' THEN 'Campo marca vacío'
        ELSE 'OK'
    END as problema
FROM productos 
WHERE precio > 0 
AND (
    descripcion IS NULL OR descripcion = '' OR
    fk_id_categoria IS NULL OR
    fk_id_marca IS NULL OR
    categoria IS NULL OR categoria = '' OR
    marca IS NULL OR marca = ''
)
ORDER BY descripcion;

-- 3. Verificar productos con precio > 0 que no tienen relaciones válidas
SELECT 'PRODUCTOS SIN RELACIONES VÁLIDAS:' as info;
SELECT 
    p.id,
    p.descripcion,
    p.precio,
    p.fk_id_categoria,
    p.fk_id_marca,
    c.id as categoria_existe,
    m.id as marca_existe
FROM productos p
LEFT JOIN categoria c ON p.fk_id_categoria = c.id
LEFT JOIN marcas m ON p.fk_id_marca = m.id
WHERE p.precio > 0 
AND (c.id IS NULL OR m.id IS NULL)
ORDER BY p.descripcion;

-- 4. Verificar productos con caracteres especiales o espacios extra
SELECT 'PRODUCTOS CON CARACTERES ESPECIALES:' as info;
SELECT 
    id,
    descripcion,
    precio,
    LENGTH(descripcion) as longitud_descripcion,
    LENGTH(TRIM(descripcion)) as longitud_sin_espacios
FROM productos 
WHERE precio > 0 
AND (
    descripcion LIKE '%  %' OR  -- Espacios dobles
    descripcion LIKE ' %' OR   -- Espacio al inicio
    descripcion LIKE '% ' OR   -- Espacio al final
    descripcion LIKE '%\t%' OR -- Tabs
    descripcion LIKE '%\n%' OR -- Saltos de línea
    descripcion LIKE '%\r%'    -- Retornos de carro
)
ORDER BY descripcion;

-- 5. Verificar productos con descripciones muy largas o muy cortas
SELECT 'PRODUCTOS CON DESCRIPCIONES EXTREMAS:' as info;
SELECT 
    id,
    descripcion,
    precio,
    LENGTH(descripcion) as longitud
FROM productos 
WHERE precio > 0 
AND (
    LENGTH(descripcion) < 3 OR
    LENGTH(descripcion) > 500
)
ORDER BY LENGTH(descripcion);

-- 6. Verificar productos con precios muy altos o muy bajos
SELECT 'PRODUCTOS CON PRECIOS EXTREMOS:' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca
FROM productos 
WHERE precio > 0 
AND (
    precio < 100 OR
    precio > 10000000
)
ORDER BY precio;

-- 7. Verificar productos duplicados
SELECT 'PRODUCTOS DUPLICADOS:' as info;
SELECT 
    descripcion,
    COUNT(*) as cantidad,
    STRING_AGG(id::text, ', ') as ids
FROM productos 
WHERE precio > 0
GROUP BY descripcion
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- 8. Verificar productos con IDs problemáticos
SELECT 'PRODUCTOS CON IDs PROBLEMÁTICOS:' as info;
SELECT 
    id,
    descripcion,
    precio,
    CASE 
        WHEN id IS NULL THEN 'ID NULL'
        WHEN id = '' THEN 'ID vacío'
        WHEN LENGTH(id::text) < 10 THEN 'ID muy corto'
        ELSE 'ID OK'
    END as problema_id
FROM productos 
WHERE precio > 0 
AND (
    id IS NULL OR
    id = '' OR
    LENGTH(id::text) < 10
);

-- 9. Comparación final: productos que deberían aparecer vs productos que aparecen con JOIN
SELECT 'COMPARACIÓN FINAL:' as info;
SELECT 
    (SELECT COUNT(*) FROM productos WHERE precio > 0) as total_productos_precio_mayor_0,
    (SELECT COUNT(*) FROM productos p
     LEFT JOIN categoria c ON p.fk_id_categoria = c.id
     LEFT JOIN marcas m ON p.fk_id_marca = m.id
     WHERE p.precio > 0 AND c.id IS NOT NULL AND m.id IS NOT NULL) as productos_con_relaciones_validas,
    (SELECT COUNT(*) FROM productos WHERE precio > 0) - 
    (SELECT COUNT(*) FROM productos p
     LEFT JOIN categoria c ON p.fk_id_categoria = c.id
     LEFT JOIN marcas m ON p.fk_id_marca = m.id
     WHERE p.precio > 0 AND c.id IS NOT NULL AND m.id IS NOT NULL) as productos_perdidos_por_joins;
