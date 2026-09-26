import http from 'node:http'

const PORT = Number(process.env.PORT || 8787)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate'

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://1mmfazilprofessional-tech.github.io',
])

function sendJson(res, status, body, origin = '*') {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  })
  res.end(payload)
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  const corsOrigin = origin && allowedOrigins.has(origin) ? origin : 'null'

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    })
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
  req.on('data', (chunk) => {
    raw += chunk
    if (raw.length > 2_000_000) req.destroy()
  })

  req.on('end', async () => {
    try {
      const payload = JSON.parse(raw || '{}')
      if (!payload.model || !payload.prompt) {
        sendJson(res, 400, { error: 'model and prompt are required' }, corsOrigin)
        return
      }

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: false }),
      })

      const text = await response.text()
      res.writeHead(response.status, {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      })
      res.end(text)
    } catch (error) {
      sendJson(res, 502, {
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
