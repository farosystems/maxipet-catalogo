-- Script para verificar políticas RLS y filtros en la tabla productos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar políticas RLS en la tabla productos
SELECT 'POLÍTICAS RLS EN TABLA PRODUCTOS:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'productos';

-- 2. Verificar si RLS está habilitado
SELECT 'RLS HABILITADO:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'productos';

-- 3. Verificar permisos de la tabla
SELECT 'PERMISOS DE LA TABLA:' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'productos';

-- 4. Probar consulta directa sin filtros
SELECT 'CONSULTA DIRECTA - TOTAL PRODUCTOS:' as info;
SELECT COUNT(*) as total FROM productos;

-- 5. Probar consulta con precio 0
SELECT 'CONSULTA DIRECTA - PRODUCTOS PRECIO 0:' as info;
SELECT COUNT(*) as precio_0 FROM productos WHERE precio = 0;

-- 6. Probar consulta con precio mayor a 0
SELECT 'CONSULTA DIRECTA - PRODUCTOS PRECIO > 0:' as info;
SELECT COUNT(*) as precio_mayor_0 FROM productos WHERE precio > 0;

-- 7. Verificar si hay algún trigger que filtre productos
SELECT 'TRIGGERS EN TABLA PRODUCTOS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'productos';
