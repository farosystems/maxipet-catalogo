import { supabase } from './supabase'

export interface Configuracion {
  id: number
  created_at: string
  telefono: string | null
}

export interface ConfiguracionWeb {
  id: number
  created_at: string
  
  // Configuraciones Desktop
  logo_url: string | null
  logo_width: number
  logo_height: number
  
  appbar_height: number
  appbar_background_color: string
  appbar_text_color: string
  
  section_title_size: number
  section_subtitle_size: number
  section_text_size: number
  
  search_box_width: number
  search_box_height: number
  
  home_section_height: number
  
  // Configuraciones Mobile
  mobile_logo_width: number
  mobile_logo_height: number
  
  mobile_appbar_height: number
  
  mobile_section_title_size: number
  mobile_section_subtitle_size: number
  mobile_section_text_size: number
  
  mobile_search_box_width: number
  mobile_search_box_height: number
  
  mobile_home_section_height: number
  
  // Colores generales
  primary_color: string
  secondary_color: string
  accent_color: string
  
  // Tipografías
  font_family_primary: string
  font_family_secondary: string

  // Configuración de productos destacados del home
  home_display_plan_id: number | null
  home_display_products_count: number
  home_display_category_filter: number | null
  home_display_brand_filter: number | null
  home_display_featured_only: boolean

  // Configuración de secciones
  combos: boolean
  titulo_seccion_combos: string | null
  combos_subtitulo: string | null
  titulo_seccion_promos: string | null
  titulo_seccion_destacados: string | null
}

export interface Zona {
  id: number
  created_at: string
  nombre: string | null
}

export interface ConfiguracionZona {
  id: number
  created_at: string
  fk_id_zona: number
  telefono: string
  zona?: Zona
}

export async function getConfiguracion(): Promise<Configuracion | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error al obtener configuración:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return null
  }
}

export async function getTelefono(): Promise<string | null> {
  const config = await getConfiguracion()
  return config?.telefono || null
}

export async function updateTelefono(telefono: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ telefono }, { onConflict: 'id' })

    if (error) {
      console.error('Error al actualizar teléfono:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error al actualizar teléfono:', error)
    return false
  }
}

export async function getZonas(): Promise<Zona[]> {
  try {
    const { data, error } = await supabase
      .from('zonas')
      .select('*')
      .order('nombre')

    if (error) {
      console.error('Error al obtener zonas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error al obtener zonas:', error)
    return []
  }
}

export async function getConfiguracionZonas(): Promise<ConfiguracionZona[]> {
  try {
    const { data, error } = await supabase
      .from('configuracion_zonas')
      .select(`
        *,
        zona:zonas(*)
      `)
      .order('fk_id_zona')

    if (error) {
      console.error('Error al obtener configuración de zonas:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error al obtener configuración de zonas:', error)
    return []
  }
}

export async function getTelefonoPorZona(zonaId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion_zonas')
      .select('telefono')
      .eq('fk_id_zona', zonaId)
      .single()

    if (error) {
      console.error('Error al obtener teléfono por zona:', error)
      return null
    }

    return data?.telefono || null
  } catch (error) {
    console.error('Error al obtener teléfono por zona:', error)
    return null
  }
}

export async function getConfiguracionWeb(): Promise<ConfiguracionWeb | null> {
  try {
    const { data, error } = await supabase
      .from('configuracion_web')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error al obtener configuración web:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error al obtener configuración web:', error)
    return null
  }
}

export async function createDefaultConfiguracionWeb(): Promise<ConfiguracionWeb | null> {
  try {
    const defaultConfig = {
      logo_url: '/LOGO2.png',
      logo_width: 200,
      logo_height: 60,
      appbar_height: 64,
      appbar_background_color: '#ffffff',
      appbar_text_color: '#000000',
      section_title_size: 24,
      section_subtitle_size: 18,
      section_text_size: 16,
      search_box_width: 400,
      search_box_height: 40,
      home_section_height: 500,
      mobile_logo_width: 150,
      mobile_logo_height: 45,
      mobile_appbar_height: 56,
      mobile_section_title_size: 20,
      mobile_section_subtitle_size: 16,
      mobile_section_text_size: 14,
      mobile_search_box_width: 300,
      mobile_search_box_height: 36,
      mobile_home_section_height: 300,
      primary_color: '#0066cc',
      secondary_color: '#f8f9fa',
      accent_color: '#ff6b35',
      font_family_primary: 'Inter, sans-serif',
      font_family_secondary: 'Roboto, sans-serif',
      home_display_plan_id: null,
      home_display_products_count: 12,
      home_display_category_filter: null,
      home_display_brand_filter: null,
      home_display_featured_only: false,
      combos: true,
      titulo_seccion_combos: 'Combos Especiales',
      combos_subtitulo: 'Aprovechá nuestros combos con descuentos especiales y ahorrá en grande',
      titulo_seccion_promos: 'Promociones',
      titulo_seccion_destacados: 'Productos Destacados'
    }

    const { data, error } = await supabase
      .from('configuracion_web')
      .insert(defaultConfig)
      .select()
      .single()

    if (error) {
      console.error('Error al crear configuración web por defecto:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error al crear configuración web por defecto:', error)
    return null
  }
}

export async function getOrCreateConfiguracionWeb(): Promise<ConfiguracionWeb | null> {
  let config = await getConfiguracionWeb()

  if (!config) {
    config = await createDefaultConfiguracionWeb()
  }

  return config
}

export async function getMostrarCombos(): Promise<boolean> {
  try {
    const config = await getOrCreateConfiguracionWeb()
    return config?.combos ?? true
  } catch (error) {
    console.error('Error al obtener configuración de combos:', error)
    return true // Por defecto mostrar combos
  }
}

export async function getTituloSeccionCombos(): Promise<string> {
  try {
    const config = await getOrCreateConfiguracionWeb()
    return config?.titulo_seccion_combos ?? 'Combos Especiales'
  } catch (error) {
    console.error('Error al obtener título de sección de combos:', error)
    return 'Combos Especiales' // Por defecto
  }
}

export async function getTituloSeccionPromos(): Promise<string> {
  try {
    const config = await getOrCreateConfiguracionWeb()
    return config?.titulo_seccion_promos ?? 'Promociones'
  } catch (error) {
    console.error('Error al obtener título de sección de promociones:', error)
    return 'Promociones' // Por defecto
  }
}

export async function getTituloSeccionDestacados(): Promise<string> {
  try {
    const config = await getOrCreateConfiguracionWeb()
    return config?.titulo_seccion_destacados ?? 'Productos Destacados'
  } catch (error) {
    console.error('Error al obtener título de sección de destacados:', error)
    return 'Productos Destacados' // Por defecto
  }
}

export async function getSubtituloCombos(): Promise<string> {
  try {
    const config = await getOrCreateConfiguracionWeb()
    return config?.combos_subtitulo ?? 'Aprovechá nuestros combos con descuentos especiales y ahorrá en grande'
  } catch (error) {
    console.error('Error al obtener subtítulo de combos:', error)
    return 'Aprovechá nuestros combos con descuentos especiales y ahorrá en grande' // Por defecto
  }
}
