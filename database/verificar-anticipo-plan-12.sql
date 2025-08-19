-- Script para verificar si el plan de 12 cuotas tiene anticipo configurado
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar todos los planes de financiación y sus anticipos
SELECT 'TODOS LOS PLANES DE FINANCIACIÓN:' as info;
SELECT 
    id,
    nombre,
    cuotas,
    recargo_porcentual,
    anticipo_minimo,
    anticipo_minimo_fijo,
    CASE 
        WHEN anticipo_minimo IS NOT NULL THEN 'Porcentaje: ' || anticipo_minimo || '%'
        WHEN anticipo_minimo_fijo IS NOT NULL THEN 'Fijo: $' || anticipo_minimo_fijo
        ELSE 'Sin anticipo'
    END as tipo_anticipo,
    activo
FROM planes_financiacion 
ORDER BY cuotas;

-- 2. Verificar específicamente el plan de 12 cuotas
SELECT 'PLAN DE 12 CUOTAS:' as info;
SELECT 
    id,
    nombre,
    cuotas,
    recargo_porcentual,
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

-- 3. Verificar qué planes tienen anticipo configurado
SELECT 'PLANES CON ANTICIPO CONFIGURADO:' as info;
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
    END as tipo_anticipo
FROM planes_financiacion 
WHERE anticipo_minimo IS NOT NULL OR anticipo_minimo_fijo IS NOT NULL
ORDER BY cuotas;
