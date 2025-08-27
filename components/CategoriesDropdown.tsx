'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Categoria } from '@/lib/products'
import { getCategories } from '@/lib/supabase-products'

interface CategoriesDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesDropdown({ isOpen, onClose }: CategoriesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar categorías de la base de datos
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Cerrar dropdown solo al hacer clic fuera, no al pasar el mouse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

     return (
     <div 
       ref={dropdownRef}
       className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 min-w-[1200px]"
     >
       <div className="p-6">
         <h3 className="text-lg font-bold text-gray-900 mb-6">Todas las Categorías</h3>
         
         {loading ? (
           <div className="flex items-center justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
           </div>
         ) : (
           <div className="grid grid-cols-5 gap-4">
             {categories.map((category) => {
               const slug = category.descripcion?.toLowerCase()
                 .replace(/[^a-z0-9]+/g, '-')
                 .replace(/^-+|-+$/g, '')
               
               return (
                 <Link 
                   key={category.id}
                   href={`/${slug}`}
                   className="flex items-center justify-between p-3 hover:bg-violet-50 rounded-lg transition-colors group border border-transparent hover:border-violet-200"
                 >
                   <span className="text-gray-700 group-hover:text-violet-600 font-medium text-sm">
                     {category.descripcion}
                   </span>
                   <ChevronRight className="text-gray-400 group-hover:text-violet-600 size-4 flex-shrink-0" />
                 </Link>
               )
             })}
           </div>
         )}
       </div>
     </div>
   )
}
