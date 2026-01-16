-- Script para verificar duplicados específicos del plan ID 4
-- Este plan parece tener registros duplicados causando el error de React

-- ============================================
-- VERIFICAR DUPLICADOS DEL PLAN 4 EN producto_planes
-- ============================================
SELECT
  fk_id_producto,
  fk_id_plan,
  COUNT(*) as cantidad_duplicados,
  array_agg(id) as ids_duplicados
FROM producto_planes
WHERE fk_id_plan = 4 AND activo = true
GROUP BY fk_id_producto, fk_id_plan
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- ============================================
-- VERIFICAR DUPLICADOS DEL PLAN 4 EN producto_planes_default
-- ============================================
SELECT
  fk_id_producto,
  fk_id_plan,
  COUNT(*) as cantidad_duplicados,
  array_agg(id) as ids_duplicados
FROM producto_planes_default
WHERE fk_id_plan = 4 AND activo = true
GROUP BY fk_id_producto, fk_id_plan
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- ============================================
-- VER TODOS LOS REGISTROS DEL PLAN 4 (sin filtrar duplicados)
-- ============================================
-- En producto_planes
SELECT
  id,
  fk_id_producto,
  fk_id_plan,
  activo,
  created_at
FROM producto_planes
WHERE fk_id_plan = 4
ORDER BY fk_id_producto, id;

-- En producto_planes_default
SELECT
  id,
  fk_id_producto,
  fk_id_plan,
  activo,
  created_at
FROM producto_planes_default
WHERE fk_id_plan = 4
ORDER BY fk_id_producto, id;

-- ============================================
-- LIMPIAR DUPLICADOS DEL PLAN 4 EN producto_planes
-- ============================================
-- IMPORTANTE: Ejecuta esto SOLO después de verificar los duplicados arriba
-- Este script mantiene el registro más ANTIGUO (menor created_at) y elimina los demás
/*
DELETE FROM producto_planes
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY fk_id_producto, fk_id_plan
        ORDER BY created_at ASC, id ASC  -- Mantiene el más antiguo
      ) as rn
    FROM producto_planes
    WHERE fk_id_plan = 4 AND activo = true
  ) AS duplicados
  WHERE rn > 1
);
*/

-- ============================================
-- LIMPIAR DUPLICADOS DEL PLAN 4 EN producto_planes_default
-- ============================================
-- IMPORTANTE: Ejecuta esto SOLO después de verificar los duplicados arriba
/*
DELETE FROM producto_planes_default
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY fk_id_producto, fk_id_plan
        ORDER BY created_at ASC, id ASC  -- Mantiene el más antiguo
      ) as rn
    FROM producto_planes_default
    WHERE fk_id_plan = 4 AND activo = true
  ) AS duplicados
  WHERE rn > 1
);
*/

-- ============================================
-- VERIFICAR RESULTADOS DESPUÉS DE LA LIMPIEZA
-- ============================================
-- Ejecuta estas consultas después de eliminar duplicados

-- Contar registros del plan 4 en producto_planes
SELECT
  COUNT(*) as total_registros,
  COUNT(DISTINCT fk_id_producto) as productos_unicos
FROM producto_planes
WHERE fk_id_plan = 4 AND activo = true;

-- Contar registros del plan 4 en producto_planes_default
SELECT
  COUNT(*) as total_registros,
  COUNT(DISTINCT fk_id_producto) as productos_unicos
FROM producto_planes_default
WHERE fk_id_plan = 4 AND activo = true;
