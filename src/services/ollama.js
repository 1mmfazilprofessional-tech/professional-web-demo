const OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'qwen2.5-coder:7b'

export function isOllamaConfigured() {
  return Boolean(OLLAMA_URL)
}

export async function askOllama(prompt, project = {}) {
  const context = project.problem ? `Project problem: ${project.problem}\nProject title: ${project.title || 'Untitled'}` : ''
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt: `${context}\n\nUser request: ${prompt}`, stream: false }),
    })
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}. Make sure Ollama is running and its local API is reachable.`)
    const data = await response.json()
    return data.response || 'The local model returned no text.'
  } catch (error) {
    if (error instanceof TypeError) {
      return 'Cannot reach Ollama from the browser. The next workstation phase should add a small local proxy/backend to avoid browser CORS restrictions.'
    }
    throw error
  }
}
