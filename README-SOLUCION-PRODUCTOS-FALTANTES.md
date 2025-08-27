# Solución: Mostrar Todos los Productos Excepto los de Precio 0

## Problema Identificado

Se reportó que de 301 artículos en la base de datos, solo se mostraban 184 en la aplicación. Además, había artículos con precio 0 que no deberían mostrarse.

## Causa del Problema

El problema principal era que las consultas de Supabase estaban usando JOINs con las tablas `categoria` y `marcas`, y si algún producto no tenía una relación válida con estas tablas, no aparecía en los resultados.

### Problemas Específicos:

1. **JOINs que excluían productos**: Las consultas originales usaban JOINs que podían excluir productos sin categoría o marca válida
2. **Falta de filtro para precio 0**: No había un filtro explícito para excluir productos con precio 0
3. **Manejo de datos faltantes**: No había un manejo robusto para productos sin categoría o marca asignada

## Solución Implementada

### 1. Eliminación de JOINs Problemáticos

Se modificaron todas las funciones de consulta de productos para:
- Obtener productos sin JOINs inicialmente
- Obtener categorías y marcas por separado
- Hacer el mapeo manualmente usando Map para búsqueda eficiente

### 2. Filtro para Excluir Productos con Precio 0

Se agregó el filtro `.gt('precio', 0)` en todas las consultas:
- `getProducts()`
- `getFeaturedProducts()`
- `getProductsByCategory()`
- `getProductsByBrand()`

### 3. Manejo Robusto de Datos Faltantes

Se implementó un sistema de fallback para productos sin categoría o marca:
```typescript
const categoria = categoriesMap.get(product.fk_id_categoria) || 
                 { id: product.fk_id_categoria || 1, descripcion: `Categoría ${product.fk_id_categoria || 1}` }

const marca = brandsMap.get(product.fk_id_marca) || 
             { id: product.fk_id_marca || 1, descripcion: `Marca ${product.fk_id_marca || 1}` }
```

## Archivos Modificados

### `lib/supabase-products.ts`
- `getProducts()`: Eliminado JOIN, agregado filtro precio > 0
- `getFeaturedProducts()`: Eliminado JOIN, agregado filtro precio > 0
- `getProductsByCategory()`: Eliminado JOIN, agregado filtro precio > 0
- `getProductsByBrand()`: Eliminado JOIN, agregado filtro precio > 0
- `getProductById()`: Eliminado JOIN, manejo robusto de datos

## Scripts SQL Creados

### `database/verificar-productos-precio-0.sql`
Script para verificar:
- Total de productos en la base de datos
- Productos con precio 0
- Productos con precio > 0
- Distribución de precios

### `database/verificar-politicas-rls.sql`
Script para verificar:
- Políticas RLS en la tabla productos
- Permisos de la tabla
- Triggers que puedan estar filtrando productos

### `database/verificar-productos-sin-categoria-marca.sql`
Script para verificar:
- Productos sin categoría asignada
- Productos sin marca asignada
- Productos que no aparecen con JOINs

### `database/filtrar-productos-precio-0.sql`
Script para:
- Verificar productos con precio 0
- Crear vista `productos_activos` que excluye precio 0
- Comparación final de productos

## Resultado Esperado

Después de estos cambios:
1. **Se mostrarán todos los productos con precio > 0** (aproximadamente 301 - productos_con_precio_0)
2. **Se excluirán automáticamente los productos con precio 0**
3. **Se mantendrá la funcionalidad de filtros y búsqueda**
4. **Se mejorará la robustez del sistema** para manejar datos faltantes

## Verificación

Para verificar que la solución funciona:

1. Ejecutar los scripts SQL en Supabase para ver los números actuales
2. Recargar la aplicación y verificar que se muestren más productos
3. Verificar en la consola del navegador los logs de `getProducts` que muestran:
   - Total productos obtenidos
   - Productos transformados

## Logs de Debug

Se agregaron logs de debug en `getProducts()`:
```typescript
//console.log('🔍 getProducts - Total productos obtenidos:', data?.length || 0)
//console.log('🔍 getProducts - Productos transformados:', transformedData.length)
```

Estos logs ayudarán a monitorear si se están obteniendo todos los productos esperados.
