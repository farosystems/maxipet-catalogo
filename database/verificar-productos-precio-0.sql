-- Script para verificar productos con precio 0 y total de productos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Total de productos
SELECT 'TOTAL DE PRODUCTOS:' as info;
SELECT COUNT(*) as total_productos FROM productos;

-- 2. Productos con precio 0
SELECT 'PRODUCTOS CON PRECIO 0:' as info;
SELECT COUNT(*) as productos_precio_0 FROM productos WHERE precio = 0;

-- 3. Productos con precio mayor a 0
SELECT 'PRODUCTOS CON PRECIO > 0:' as info;
SELECT COUNT(*) as productos_precio_mayor_0 FROM productos WHERE precio > 0;

-- 4. Lista de productos con precio 0
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

-- 5. Distribución de precios
SELECT 'DISTRIBUCIÓN DE PRECIOS:' as info;
SELECT 
    CASE 
        WHEN precio = 0 THEN 'Precio 0'
        WHEN precio BETWEEN 1 AND 10000 THEN '1 - 10,000'
        WHEN precio BETWEEN 10001 AND 50000 THEN '10,001 - 50,000'
        WHEN precio BETWEEN 50001 AND 100000 THEN '50,001 - 100,000'
        WHEN precio BETWEEN 100001 AND 500000 THEN '100,001 - 500,000'
        WHEN precio > 500000 THEN 'Más de 500,000'
    END as rango_precio,
    COUNT(*) as cantidad
FROM productos 
GROUP BY 
    CASE 
        WHEN precio = 0 THEN 'Precio 0'
        WHEN precio BETWEEN 1 AND 10000 THEN '1 - 10,000'
        WHEN precio BETWEEN 10001 AND 50000 THEN '10,001 - 50,000'
        WHEN precio BETWEEN 50001 AND 100000 THEN '50,001 - 100,000'
        WHEN precio BETWEEN 100001 AND 500000 THEN '100,001 - 500,000'
        WHEN precio > 500000 THEN 'Más de 500,000'
    END
ORDER BY 
    CASE rango_precio
        WHEN 'Precio 0' THEN 1
        WHEN '1 - 10,000' THEN 2
        WHEN '10,001 - 50,000' THEN 3
        WHEN '50,001 - 100,000' THEN 4
        WHEN '100,001 - 500,000' THEN 5
        WHEN 'Más de 500,000' THEN 6
    END;
