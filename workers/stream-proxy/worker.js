/* Cloudflare Worker: stream proxy that adds CORS headers
   Usage:
   - GET /stream -> proxies default stream
   - GET /stream?u=<encodedUrl> -> proxies specified upstream
   - OPTIONS /stream -> responds to preflight
*/

addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

const DEFAULT_UPSTREAM = 'https://uk5freenew.listen2myradio.com/live.mp3?typeportmount=s1_23756_stream_375931828'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Range,Accept,Origin,Referer,User-Agent,Pragma,Cache-Control'
  }
}

async function handle(request) {
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  let upstream = DEFAULT_UPSTREAM
  if (url.searchParams.has('u')) {
    try {
      const candidate = url.searchParams.get('u')
      const parsed = new URL(candidate)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        upstream = parsed.toString()
      }
    } catch (e) {
      // ignore and fallback to default
    }
  }

  try {
    const res = await fetch(upstream, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OREMRD-stream-proxy/1.0)'
      }
    })

    const headers = new Headers(res.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Range,Accept,Origin,Referer,User-Agent,Pragma,Cache-Control')

    return new Response(res.body, { status: res.status, headers })
  } catch (err) {
    const headers = new Headers(corsHeaders())
    return new Response('Upstream fetch failed: ' + err.message, { status: 502, headers })
  }
}
