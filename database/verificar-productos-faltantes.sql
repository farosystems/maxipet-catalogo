-- Script para verificar productos que podrían estar faltando
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar productos con precio > 0 que no tienen relaciones válidas
SELECT 'PRODUCTOS CON PRECIO > 0 SIN RELACIONES VÁLIDAS:' as info;
SELECT 
    p.id,
    p.descripcion,
    p.precio,
    p.fk_id_categoria,
    p.fk_id_marca,
    CASE 
        WHEN c.id IS NULL THEN 'Categoría no existe'
        ELSE 'Categoría OK'
    END as estado_categoria,
    CASE 
        WHEN m.id IS NULL THEN 'Marca no existe'
        ELSE 'Marca OK'
    END as estado_marca
FROM productos p
LEFT JOIN categoria c ON p.fk_id_categoria = c.id
LEFT JOIN marcas m ON p.fk_id_marca = m.id
WHERE p.precio > 0 
AND (c.id IS NULL OR m.id IS NULL)
ORDER BY p.descripcion;

-- 2. Verificar productos con campos NULL o vacíos
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
        WHEN descripcion IS NULL OR TRIM(descripcion) = '' THEN 'Descripción vacía'
        WHEN fk_id_categoria IS NULL THEN 'Sin categoría'
        WHEN fk_id_marca IS NULL THEN 'Sin marca'
        WHEN categoria IS NULL OR TRIM(categoria) = '' THEN 'Campo categoria vacío'
        WHEN marca IS NULL OR TRIM(marca) = '' THEN 'Campo marca vacío'
        ELSE 'OK'
    END as problema
FROM productos 
WHERE precio > 0 
AND (
    descripcion IS NULL OR TRIM(descripcion) = '' OR
    fk_id_categoria IS NULL OR
    fk_id_marca IS NULL OR
    categoria IS NULL OR TRIM(categoria) = '' OR
    marca IS NULL OR TRIM(marca) = ''
)
ORDER BY descripcion;

-- 3. Verificar productos con caracteres especiales en la descripción
SELECT 'PRODUCTOS CON CARACTERES ESPECIALES:' as info;
SELECT 
    id,
    descripcion,
    precio,
    LENGTH(descripcion) as longitud,
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

-- 4. Verificar productos con descripciones muy cortas o muy largas
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

-- 5. Verificar productos duplicados
SELECT 'PRODUCTOS DUPLICADOS:' as info;
SELECT 
    descripcion,
    COUNT(*) as cantidad,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(precio::text, ', ') as precios
FROM productos 
WHERE precio > 0
GROUP BY descripcion
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- 6. Comparación final: productos que deberían aparecer
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

-- 7. Lista de productos que se perderían con JOINs estrictos
SELECT 'PRODUCTOS QUE SE PERDERÍAN CON JOINs ESTRICTOS:' as info;
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

-- 8. Verificar si hay productos con IDs de categoría o marca que no existen
SELECT 'CATEGORÍAS Y MARCAS REFERENCIADAS PERO NO EXISTENTES:' as info;
SELECT 
    'Categorías no existentes' as tipo,
    p.fk_id_categoria as id_referenciado,
    COUNT(*) as cantidad_productos
FROM productos p
LEFT JOIN categoria c ON p.fk_id_categoria = c.id
WHERE p.precio > 0 AND c.id IS NULL
GROUP BY p.fk_id_categoria

UNION ALL

SELECT 
    'Marcas no existentes' as tipo,
    p.fk_id_marca as id_referenciado,
    COUNT(*) as cantidad_productos
FROM productos p
LEFT JOIN marcas m ON p.fk_id_marca = m.id
WHERE p.precio > 0 AND m.id IS NULL
GROUP BY p.fk_id_marca

ORDER BY tipo, id_referenciado;
