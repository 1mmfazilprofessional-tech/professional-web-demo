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


export async function analyzeArchitecture(project, blueprint, analysis = null) {
  const prompt = `You are a senior full-stack architect and hackathon engineering lead.

Design a concrete technical architecture for the project below. Use the existing problem intelligence and blueprint. Do not invent unnecessary infrastructure. Optimize for a small team, limited hackathon time, reliability, security and a clear demo.

Return ONLY valid JSON:
{
  "layers": [
    {"name":"","technology":"","responsibility":"","connectsTo":[]}
  ],
  "dataFlow": [],
  "security": [],
  "failureHandling": [],
  "projectStructure": []
}

Project:
Title: ${project.title || 'Untitled'}
Problem: ${project.problem}
Platform: ${project.platform || 'Web application'}
Duration: ${project.duration || 'Not specified'}
Team size: ${project.teamSize || 'Not specified'}
Constraints: ${project.constraints || 'Not specified'}

Blueprint:
Features: ${JSON.stringify(blueprint.features || [])}
Screens: ${JSON.stringify(blueprint.screens || [])}
Services: ${JSON.stringify(blueprint.services || [])}

Problem intelligence:
${JSON.stringify(analysis || {})}

The architecture must explicitly consider frontend/backend boundaries, APIs, data persistence, authentication if required, AI integrations if useful, validation, error handling, security, and how the pieces communicate. Prefer technologies already selected by the blueprint unless there is a strong reason to change them.`
  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid architecture JSON. Run the architecture generation again.')
  }
}


export async function analyzeExperience(project, blueprint, architecture, analysis = null) {
  const prompt = [
    'You are a senior product designer, UX engineer and frontend architect for a hackathon product.',
    'Design the user experience from the actual project problem, blueprint and architecture.',
    'Focus on usable flows, responsive behavior, accessibility, meaningful interaction states, and visual/3D/animation opportunities only where they improve the product.',
    'Return ONLY valid JSON with keys: experiencePrinciples (array), primaryUserFlow (array), screens (array of objects with name,purpose,primaryAction,states), interactionRules (array), accessibility (array), motionAndVisuals (array), failureStates (array).',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Problem intelligence: ' + JSON.stringify(analysis || {}),
    'Be specific and implementable. Avoid decorative features that do not support the problem.'
  ].join('\n')
  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid UX JSON. Run the experience generation again.')
  }
}


export async function analyzeCodePlan(project, blueprint, architecture, experience) {
  const prompt = [
    'You are a senior software architect and implementation lead.',
    'Create an implementation plan that is concrete enough for a developer or code-generation agent to execute.',
    'Return ONLY valid JSON with keys: files (array of {path,purpose}), implementationOrder (array), coreInterfaces (array), acceptanceCriteria (array), riskAreas (array), gitCheckpoints (array).',
    'Do not output source code. Plan the real files, modules, interfaces, integration boundaries and verification points.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Favor simple, maintainable hackathon architecture. Avoid unnecessary infrastructure.'
  ].join('\n')
  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid code-plan JSON. Run the code plan again.')
  }
}


export async function analyzeIntegration(project, blueprint, architecture, experience, codePlan) {
  const prompt = [
    'You are a senior integration engineer and reliability-focused hackathon technical lead.',
    'Trace how the planned frontend, backend, APIs, database, authentication, AI services and code modules connect.',
    'Identify missing interface contracts, integration risks, verification checks and change impact.',
    'Return ONLY valid JSON with keys: overallStatus, summary, readyCount, reviewCount, connections (array of {from,to,contract,status}), missingContracts (array), risks (array), verificationChecks (array), changeImpact (array).',
    'Status values for connections should be Ready, Planned, or Review.',
    'Do not claim an integration is actually working unless the supplied project evidence supports it. This is an architecture/plan-level check.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Code plan: ' + JSON.stringify(codePlan || {}),
  ].join('\n')
  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid integration JSON. Run the integration check again.')
  }
}


export async function analyzeError(errorInput, project = {}, architecture = null, codePlan = null, integration = null) {
  const prompt = [
    'You are a senior debugging engineer, software reliability engineer and root-cause analyst.',
    'Analyze the supplied software failure. Do not pretend to have executed code or inspected files that were not supplied.',
    'Separate observed evidence from hypotheses. Rank root-cause hypotheses by plausibility, identify affected areas, propose a minimal safe fix plan, verification steps and regression prevention.',
    'Return ONLY valid JSON with keys: category, severity, confidence, summary, rootCauseHypotheses (array), affectedAreas (array), fixPlan (array), verificationSteps (array), regressionPrevention (array).',
    'Project context: ' + JSON.stringify(project),
    'Architecture context: ' + JSON.stringify(architecture || {}),
    'Code plan context: ' + JSON.stringify(codePlan || {}),
    'Integration context: ' + JSON.stringify(integration || {}),
    'Failure input: ' + errorInput
  ].join('\n')
  const raw = await generate(prompt)
  try {
    return JSON.parse(raw)
  } catch {
    const fenced = raw.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/)
    if (fenced) return JSON.parse(fenced[1])
    throw new Error('The local model returned invalid debugging JSON. Run the investigation again.')
  }
}
