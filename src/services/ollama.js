const OLLAMA_PROXY_URL = '/api/ollama'
const DIRECT_OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'qwen2.5-coder:7b'

export function isOllamaConfigured() {
  return true
}

async function generate(prompt, model = MODEL) {
  const payload = { model, prompt, stream: false, options: { temperature: 0.2 } }
  let response
  try {
    response = await fetch(OLLAMA_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  } catch {
    response = null
  }
  if (!response || !response.ok) {
    try {
      response = await fetch(DIRECT_OLLAMA_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } catch {
      throw new Error('Local Ollama is not reachable. Start Ollama and the DevStation local proxy on port 8787.')
    }
  }
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}. Check that the selected model is installed.`)
  const data = await response.json()
  return data.response || ''
}

export async function askOllama(prompt, project = {}) {
  const context = project.problem ? `Project problem: ${project.problem}\nProject title: ${project.title || 'Untitled'}` : ''
  return generate(`${context}\n\nUser request: ${prompt}`)
}

export async function analyzeProblem(project) {
  const prompt = `You are the lead product strategist, senior software architect, UX engineer, security reviewer, QA engineer and hackathon mentor for a developer workstation.

Analyze this project deeply. Do not merely restate it. Identify the actual problem, users, root causes, assumptions, constraints, edge cases, risks, measurable outcomes, MVP, high-value innovations, and features that should be avoided because they add scope without enough value.

Return ONLY valid JSON with this exact top-level shape:
{
  "problemUnderstanding": {"summary":"", "rootCauses":[], "assumptions":[], "risks":[]},
  "users": [{"type":"","needs":[],"painPoints":[]}],
  "successMetrics": [],
  "mvpFeatures": [{"name":"","reason":""}],
  "innovations": [{"name":"","value":"","complexity":"low|medium|high"}],
  "edgeCases": [],
  "constraints": [],
  "recommendedScreens": [],
  "recommendedServices": [],
  "technicalConsiderations": [],
  "avoidForNow": [],
  "nextActions": []
}

Project:
Title: ${project.title || 'Untitled'}
Problem: ${project.problem}
Target users: ${project.users || 'Not specified'}
Platform: ${project.platform || 'Web application'}
Hackathon duration: ${project.duration || 'Not specified'}
Team size: ${project.teamSize || 'Not specified'}
Constraints: ${project.constraints || 'Not specified'}

Be concrete and hackathon-realistic. Prefer a smaller reliable MVP plus a few differentiated innovations over a huge feature list.`

  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid JSON. Run the analysis again.')
  }
}
