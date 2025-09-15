export interface Linea {
  id: number
  descripcion: string
  created_at?: string
}

export interface Categoria {
  id: number
  descripcion: string
  fk_id_linea?: number
  created_at: string
  linea?: Linea
}

export interface Marca {
  id: number
  descripcion: string
  logo?: string
  created_at: string
}

export interface PlanFinanciacion {
  id: number
  nombre: string
  cuotas: number
  recargo_porcentual: number
  recargo_fijo: number
  monto_minimo: number
  monto_maximo?: number
  anticipo_minimo?: number
  anticipo_minimo_fijo?: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PlanCategoria {
  id: number
  fk_id_plan: number
  fk_id_categoria: number
  activo: boolean
  created_at: string
  plan?: PlanFinanciacion
  categoria?: Categoria
}

export interface ProductoPlan {
  id: number
  fk_id_producto: number
  fk_id_plan: number
  activo: boolean
  created_at: string
}

export interface ProductoPlanDefault {
  id: number
  fk_id_producto: number
  fk_id_plan: number
  activo: boolean
  created_at: string
}

export interface FinancingPlan {
  installments: number
  monthlyPayment: number
}

export interface Product {
  id: string
  descripcion: string
  descripcion_detallada: string
  precio: number
  stock: number
  imagen: string
  imagen_2?: string
  imagen_3?: string
  imagen_4?: string
  imagen_5?: string
  fk_id_categoria: number
  fk_id_marca: number
  destacado: boolean
  tiene_stock: boolean
  // Nuevos campos para configuración de planes
  aplicar_todos_planes?: boolean
  aplicar_planes_categoria?: boolean
  aplicar_planes_especiales?: boolean
  created_at?: string
  updated_at?: string
  
  // Campos adicionales para mantener compatibilidad
  name?: string
  description?: string
  price?: number
  image?: string
  featured?: boolean
  category?: string
  brand?: string
  financingPlans?: FinancingPlan[]
  specifications?: string[]
  
  // Relaciones (se llenarán con JOIN)
  categoria?: Categoria
  marca?: Marca
  planes_financiacion?: PlanFinanciacion[]
}

export interface Combo {
  id: number
  nombre: string
  descripcion?: string
  fecha_vigencia_inicio?: string
  fecha_vigencia_fin?: string
  descuento_porcentaje: number
  precio_combo: number
  precio_original: number
  imagen?: string
  imagen_2?: string
  imagen_3?: string
  imagen_4?: string
  imagen_5?: string
  activo: boolean
  created_at: string
  updated_at: string

  // Relaciones
  productos?: ComboProducto[]
  imagenes?: string[]
}

export interface ComboProducto {
  id: number
  fk_id_combo: number
  fk_id_producto: number
  cantidad: number
  precio_unitario: number
  created_at: string

  // Relación con producto
  producto?: Product
}
