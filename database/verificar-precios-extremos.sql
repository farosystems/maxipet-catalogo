-- Script para verificar productos con precios extremos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar productos con precios muy altos (> 1,000,000)
SELECT 'PRODUCTOS CON PRECIOS MUY ALTOS (> 1,000,000):' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca,
    destacado
FROM productos 
WHERE precio > 1000000
ORDER BY precio DESC;

-- 2. Verificar productos con precios muy bajos (< 100)
SELECT 'PRODUCTOS CON PRECIOS MUY BAJOS (< 100):' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca,
    destacado
FROM productos 
WHERE precio > 0 AND precio < 100
ORDER BY precio;

-- 3. Verificar productos con precios exactamente en los límites
SELECT 'PRODUCTOS CON PRECIOS EN LÍMITES:' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca,
    destacado,
    CASE 
        WHEN precio = 0 THEN 'Precio 0'
        WHEN precio = 1000000 THEN 'Precio 1,000,000'
        WHEN precio > 1000000 THEN 'Precio > 1,000,000'
        ELSE 'Precio normal'
    END as tipo_precio
FROM productos 
WHERE precio = 0 OR precio = 1000000 OR precio > 1000000
ORDER BY precio;

-- 4. Distribución de precios por rangos
SELECT 'DISTRIBUCIÓN DE PRECIOS:' as info;
SELECT 
    CASE 
        WHEN precio = 0 THEN 'Precio 0'
        WHEN precio BETWEEN 1 AND 1000 THEN '1 - 1,000'
        WHEN precio BETWEEN 1001 AND 10000 THEN '1,001 - 10,000'
        WHEN precio BETWEEN 10001 AND 50000 THEN '10,001 - 50,000'
        WHEN precio BETWEEN 50001 AND 100000 THEN '50,001 - 100,000'
        WHEN precio BETWEEN 100001 AND 500000 THEN '100,001 - 500,000'
        WHEN precio BETWEEN 500001 AND 1000000 THEN '500,001 - 1,000,000'
        WHEN precio > 1000000 THEN 'Más de 1,000,000'
    END as rango_precio,
    COUNT(*) as cantidad
FROM productos 
GROUP BY 
    CASE 
        WHEN precio = 0 THEN 'Precio 0'
        WHEN precio BETWEEN 1 AND 1000 THEN '1 - 1,000'
        WHEN precio BETWEEN 1001 AND 10000 THEN '1,001 - 10,000'
        WHEN precio BETWEEN 10001 AND 50000 THEN '10,001 - 50,000'
        WHEN precio BETWEEN 50001 AND 100000 THEN '50,001 - 100,000'
        WHEN precio BETWEEN 100001 AND 500000 THEN '100,001 - 500,000'
        WHEN precio BETWEEN 500001 AND 1000000 THEN '500,001 - 1,000,000'
        WHEN precio > 1000000 THEN 'Más de 1,000,000'
    END
ORDER BY 
    CASE rango_precio
        WHEN 'Precio 0' THEN 1
        WHEN '1 - 1,000' THEN 2
        WHEN '1,001 - 10,000' THEN 3
        WHEN '10,001 - 50,000' THEN 4
        WHEN '50,001 - 100,000' THEN 5
        WHEN '100,001 - 500,000' THEN 6
        WHEN '500,001 - 1,000,000' THEN 7
        WHEN 'Más de 1,000,000' THEN 8
    END;

-- 5. Verificar productos que serían excluidos por el filtro de precio [0, 1000000]
SELECT 'PRODUCTOS EXCLUIDOS POR FILTRO [0, 1000000]:' as info;
SELECT 
    id,
    descripcion,
    precio,
    categoria,
    marca,
    destacado,
    CASE 
        WHEN precio = 0 THEN 'Excluido: precio = 0'
        WHEN precio > 1000000 THEN 'Excluido: precio > 1,000,000'
        ELSE 'Incluido'
    END as estado
FROM productos 
WHERE precio = 0 OR precio > 1000000
ORDER BY precio;

-- 6. Comparación final
SELECT 'COMPARACIÓN FINAL:' as info;
SELECT 
    (SELECT COUNT(*) FROM productos) as total_productos,
    (SELECT COUNT(*) FROM productos WHERE precio > 0 AND precio <= 1000000) as productos_en_rango,
    (SELECT COUNT(*) FROM productos WHERE precio = 0) as productos_precio_0,
    (SELECT COUNT(*) FROM productos WHERE precio > 1000000) as productos_precio_muy_alto,
    (SELECT COUNT(*) FROM productos WHERE precio > 0 AND precio <= 1000000) as productos_que_deberian_aparecer;
