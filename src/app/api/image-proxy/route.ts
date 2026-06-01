import { NextResponse } from 'next/server'

const ALLOWED_DOMAINS = [
  'simmoto.com',
  'www.simmoto.com',
  'placehold.co',
  'via.placeholder.com',
  'motoluxofficial.com',
  'cdn.jsdelivr.net',
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(imageUrl)
    } catch {
      return new NextResponse('Invalid URL', { status: 400 })
    }

    // Check domain whitelist
    const hostname = parsedUrl.hostname.toLowerCase()
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
    
    if (!isAllowed) {
      return new NextResponse('Domain not allowed', { status: 403 })
    }

    // Block private IPs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return new NextResponse('Private IPs not allowed', { status: 403 })
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': parsedUrl.origin + '/',
      },
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    // Verify it's an image
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
      return new NextResponse('Not an image', { status: 400 })
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[IMAGE-PROXY] Error:', error.message)
    return new NextResponse('Internal error', { status: 500 })
  }
}
