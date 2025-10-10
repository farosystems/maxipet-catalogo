import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('🔍 Image Proxy - URL solicitada:', imageUrl)

    if (!imageUrl) {
      console.log('❌ Image Proxy - No URL parameter')
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Permitir URLs de Supabase y PostImages para seguridad
    const allowedDomains = ['supabase.co', 'postimages.org', 'postimg.cc']
    const isAllowed = allowedDomains.some(domain => imageUrl.includes(domain))

    if (!isAllowed) {
      console.log('❌ Image Proxy - Invalid URL (not from allowed domains)')
      return new NextResponse('Invalid URL', { status: 400 })
    }

    console.log('📥 Image Proxy - Fetching image...')

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.facebook.com/',
      }
    })

    console.log('📤 Image Proxy - Response status:', response.status)

    if (!response.ok) {
      console.log('❌ Image Proxy - Error:', response.statusText)
      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    console.log('✅ Image Proxy - Success, content type:', contentType, 'size:', imageBuffer.byteLength)

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('💥 Image Proxy - Error:', error)
    return new NextResponse('Error fetching image', { status: 500 })
  }
}