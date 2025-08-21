"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { debugProductByName, debugAllProducts, debugMissingProducts } from '@/lib/debug-products'

export default function DebugProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debugResults, setDebugResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearchProduct = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      const results = await debugProductByName(searchTerm)
      setDebugResults(results)
      console.log('🔍 Debug results:', results)
    } catch (error) {
      console.error('❌ Error en búsqueda:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDebugAll = async () => {
    setLoading(true)
    try {
      const results = await debugAllProducts()
      setDebugResults(results)
      console.log('🔍 Debug all results:', results)
    } catch (error) {
      console.error('❌ Error en debug all:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDebugMissing = async () => {
    setLoading(true)
    try {
      const results = await debugMissingProducts()
      setDebugResults(results)
      console.log('🔍 Debug missing results:', results)
    } catch (error) {
      console.error('❌ Error en debug missing:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Debug de Productos</h3>
      
      <div className="space-y-4">
        {/* Búsqueda específica */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Producto Específico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchProduct()}
              />
              <Button 
                onClick={handleSearchProduct}
                disabled={loading || !searchTerm.trim()}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botones de debug */}
        <div className="flex gap-2">
          <Button 
            onClick={handleDebugAll}
            disabled={loading}
            variant="outline"
          >
            Debug Todos los Productos
          </Button>
          <Button 
            onClick={handleDebugMissing}
            disabled={loading}
            variant="outline"
          >
            Debug Productos Faltantes
          </Button>
        </div>

        {/* Resultados */}
        {debugResults && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(debugResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
