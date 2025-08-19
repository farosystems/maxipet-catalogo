-- Script para agregar anticipo al plan de 12 cuotas
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar el plan de 12 cuotas actual
SELECT 'PLAN DE 12 CUOTAS ACTUAL:' as info;
SELECT 
    id,
    nombre,
    cuotas,
    anticipo_minimo,
    anticipo_minimo_fijo,
    activo
FROM planes_financiacion 
WHERE cuotas = 12;

-- 2. Agregar anticipo del 15% al plan de 12 cuotas
UPDATE planes_financiacion 
SET anticipo_minimo = 15.00 
WHERE cuotas = 12;

-- 3. Verificar el cambio
SELECT 'PLAN DE 12 CUOTAS DESPUÉS DEL CAMBIO:' as info;
SELECT 
    id,
    nombre,
    cuotas,
    anticipo_minimo,
    anticipo_minimo_fijo,
    CASE 
        WHEN anticipo_minimo IS NOT NULL THEN 'Porcentaje: ' || anticipo_minimo || '%'
        WHEN anticipo_minimo_fijo IS NOT NULL THEN 'Fijo: $' || anticipo_minimo_fijo
        ELSE 'Sin anticipo'
    END as tipo_anticipo,
    activo
FROM planes_financiacion 
WHERE cuotas = 12;

-- 4. Calcular el anticipo para un producto de $95,000
SELECT 'CÁLCULO DE ANTICIPO PARA PRODUCTO DE $95,000:' as info;
SELECT 
    95000 as precio_producto,
    15.00 as porcentaje_anticipo,
    (95000 * 15.00 / 100) as anticipo_calculado,
    ROUND((95000 * 15.00 / 100), 2) as anticipo_redondeado;
