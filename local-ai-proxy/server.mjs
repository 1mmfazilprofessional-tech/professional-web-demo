import http from 'node:http'

const PORT = Number(process.env.PORT || 8787)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate'

const MAX_BODY_BYTES = 2_000_000
const REQUEST_TIMEOUT_MS = 120_000

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://1mmfazilprofessional-tech.github.io',
])

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
    'Vary': 'Origin',
  }
}

function sendJson(res, status, body, origin) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(origin),
  })
  res.end(payload)
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  const corsOrigin = origin && allowedOrigins.has(origin) ? origin : null

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(corsOrigin))
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'devstation-local-ai-proxy' }, corsOrigin)
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/ollama') {
    sendJson(res, 404, { error: 'Not found' }, corsOrigin)
    return
  }

  let raw = ''
  req.setEncoding('utf8')
  let rejected = false
  req.on('data', (chunk) => {
    raw += chunk
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES && !rejected) {
      rejected = true
      sendJson(res, 413, { error: 'Request body is too large.' }, corsOrigin)
      req.destroy()
    }
  })

  req.on('end', async () => {
    try {
      if (rejected) return
      const payload = JSON.parse(raw || '{}')
      if (!payload.model || !payload.prompt) {
        sendJson(res, 400, { error: 'model and prompt are required' }, corsOrigin)
        return
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: false }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const text = await response.text()
      res.writeHead(response.status, {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        ...corsHeaders(corsOrigin),
      })
      res.end(text)
    } catch (error) {
      sendJson(res, error?.name === 'AbortError' ? 504 : 502, {
        error: 'Cannot reach local Ollama.',
        detail: error instanceof Error ? error.message : String(error),
      }, corsOrigin)
    }
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`DevStation Ollama proxy listening on http://127.0.0.1:${PORT}`)
  console.log(`Forwarding requests to ${OLLAMA_URL}`)
})
