const LOCAL_PROXY_URL = 'http://127.0.0.1:8787/api/ollama'
const SAME_ORIGIN_PROXY_URL = '/api/ollama'
const DIRECT_OLLAMA_URL = 'http://127.0.0.1:11434/api/generate'
const MODEL = 'qwen2.5-coder:7b'
const REQUEST_TIMEOUT_MS = 45_000

export function getOllamaConfig() {
  return {
    model: MODEL,
    proxyUrl: LOCAL_PROXY_URL,
    directUrl: DIRECT_OLLAMA_URL,
  }
}

export function isOllamaConfigured() {
  return Boolean(MODEL)
}

export async function checkOllamaHealth() {
  try {
    const response = await fetch('http://127.0.0.1:8787/health', { method: 'GET' })
    if (!response.ok) throw new Error(`Proxy returned HTTP ${response.status}.`)
    const data = await response.json()
    return { ok: data.ok === true, model: MODEL, endpoint: LOCAL_PROXY_URL }
  } catch (error) {
    return {
      ok: false,
      model: MODEL,
      endpoint: LOCAL_PROXY_URL,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function generate(prompt, model = MODEL) {
  const payload = { model, prompt, stream: false, options: { temperature: 0.2 } }

  const endpoints = [
    LOCAL_PROXY_URL,
    SAME_ORIGIN_PROXY_URL,
    DIRECT_OLLAMA_URL,
  ]

  let lastError = null

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.ok) {
        const data = await response.json()
        if (typeof data.response !== 'string') throw new Error('Local Ollama returned an unexpected response.')
        return data.response
      }

      lastError = new Error(`Ollama returned HTTP ${response.status}.`)
    } catch (error) {
      lastError = error?.name === 'AbortError' ? new Error('Local Ollama request timed out after 45 seconds.') : error
    }
  }

  throw new Error(
    lastError?.message || 'Cannot reach local Ollama. Start Ollama and run local-ai-proxy/start-proxy.bat from the workstation repository.'
  )
}

function parseJsonResponse(raw, label) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`Local AI returned an empty ${label} response.`)
  }

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const firstObject = cleaned.indexOf('{')
    const lastObject = cleaned.lastIndexOf('}')
    if (firstObject >= 0 && lastObject > firstObject) {
      try { return JSON.parse(cleaned.slice(firstObject, lastObject + 1)) } catch {}
    }

    const firstArray = cleaned.indexOf('[')
    const lastArray = cleaned.lastIndexOf(']')
    if (firstArray >= 0 && lastArray > firstArray) {
      try { return JSON.parse(cleaned.slice(firstArray, lastArray + 1)) } catch {}
    }

    throw new Error(`Local AI returned invalid ${label} JSON. The response was not parseable.`)
  }
}

function validateStructuredResult(value, requiredKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Local AI ${label} returned an invalid structure.`)
  }

  for (const key of requiredKeys) {
    if (!(key in value)) {
      throw new Error(`Local AI ${label} is missing the ${key} field.`)
    }
  }

  return value
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
  "serviceDecisions": [{"service":"","needed":false,"reason":""}],
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

Be concrete and hackathon-realistic. Prefer a smaller reliable MVP plus a few differentiated innovations over a huge feature list. For every backend, database, authentication, API, AI/model, external service or server recommendation, explicitly decide whether it is actually necessary for the stated problem and duration. Do not recommend infrastructure merely because it is common. A simple client-side app should remain client-side.`

  const parsed = parseJsonResponse(await generate(prompt), 'problem analysis')
  return validateStructuredResult(parsed, ["problemUnderstanding","mvpFeatures"], 'problem analysis')
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
  const parsed = parseJsonResponse(await generate(prompt), 'architecture')
  return validateStructuredResult(parsed, ["layers"], 'architecture')
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
  const parsed = parseJsonResponse(await generate(prompt), 'UX analysis')
  return validateStructuredResult(parsed, ["screens"], 'UX analysis')
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
  const parsed = parseJsonResponse(await generate(prompt), 'code plan')
  return validateStructuredResult(parsed, ["files"], 'code plan')
}


export async function buildProduct(project, blueprint, analysis, architecture, experience, codePlan, integration, quality, testing, deployment, presentation) {
  const prompt = [
    'You are the implementation agent inside a local developer workstation.',
    'Build a REAL, runnable MVP for the project below using the completed engineering decisions.',
    'This is not a plan. Generate the actual product source file.',
    'Return ONLY valid JSON with this exact shape:',
    '{',
    '  "productName": "",',
    '  "files": [{"path":"index.html","content":""},{"path":"README.md","content":""}],',
    '  "runInstructions": [],',
    '  "acceptanceCriteria": []',
    '}',
    'Hard requirements:',
    '- index.html MUST be a complete standalone browser application.',
    '- Put CSS and JavaScript inside index.html so it runs immediately when opened without npm, a server, external libraries or network access.',
    '- Implement the actual core user journey, not a mockup or static screenshot.',
    '- Make all important controls functional.',
    '- Use local browser state when persistence is useful.',
    '- Include responsive mobile/desktop layout, accessible labels, loading/empty/success/error states where relevant.',
    '- Do not use fake buttons, placeholder lorem ipsum, TODO markers or claims that features exist when they do not.',
    '- Do not load external scripts, fonts, APIs, images or CDNs.',
    '- The README should explain what was generated and how to run index.html.',
    '- Keep the MVP appropriate for the stated hackathon duration.',
    '- If the architecture contains unnecessary backend/database/AI infrastructure for this problem, prefer the smallest working browser implementation while preserving the core outcome.',
    '- Escape JSON correctly. Do not wrap the response in Markdown fences.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Problem intelligence: ' + JSON.stringify(analysis || {}),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Code plan: ' + JSON.stringify(codePlan || {}),
    'Integration: ' + JSON.stringify(integration || {}),
    'Quality: ' + JSON.stringify(quality || {}),
    'Testing: ' + JSON.stringify(testing || {}),
    'Deployment: ' + JSON.stringify(deployment || {}),
    'Presentation: ' + JSON.stringify(presentation || {}),
    'Return a polished, complete, genuinely usable MVP.'
  ].join('\n')

  const parsed = parseJsonResponse(await generate(prompt), 'product build')
  const result = validateStructuredResult(parsed, ['productName', 'files', 'runInstructions', 'acceptanceCriteria'], 'product build')
  if (!Array.isArray(result.files) || result.files.length === 0) {
    throw new Error('Local AI product build did not return any files.')
  }
  const files = result.files
    .filter((file) => file && typeof file.path === 'string' && typeof file.content === 'string')
    .slice(0, 6)
  if (!files.some((file) => file.path === 'index.html')) {
    throw new Error('Local AI product build did not include the required runnable index.html file.')
  }
  return { ...result, files }
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
  const parsed = parseJsonResponse(await generate(prompt), 'integration analysis')
  return validateStructuredResult(parsed, ["connections"], 'integration analysis')
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
  const parsed = parseJsonResponse(await generate(prompt), 'debug analysis')
  return validateStructuredResult(parsed, ["rootCauseHypotheses"], 'debug analysis')
}


export async function analyzeQuality(project, blueprint, architecture, experience, codePlan, integration) {
  const prompt = [
    'You are a senior application security engineer, QA lead, accessibility specialist and performance engineer.',
    'Review the proposed hackathon system before implementation. Be concrete and evidence-aware.',
    'Do not claim a system is secure, accessible, fast or production-ready without evidence. Mark uncertain items as Review.',
    'Return ONLY valid JSON with keys: overallStatus, summary, riskCount, domains (array of {name,status,findings}), priorityRisks (array), remediationTasks (array), performanceChecks (array), securityChecks (array).',
    'Evaluate security, accessibility, performance, reliability, maintainability and hackathon delivery risk.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Code plan: ' + JSON.stringify(codePlan || {}),
    'Integration: ' + JSON.stringify(integration || {})
  ].join('\n')
  const parsed = parseJsonResponse(await generate(prompt), 'quality review')
  return validateStructuredResult(parsed, ["domains"], 'quality review')
}


export async function analyzeTesting(project, blueprint, architecture, experience, codePlan, integration, quality) {
  const prompt = [
    'You are a senior QA engineer, test architect and hackathon release lead.',
    'Create a practical verification strategy for the proposed system. Prioritize the critical user journey and integration boundaries.',
    'Do not claim tests have passed. This is a test plan and verification gate.',
    'Return ONLY valid JSON with keys: overallStatus, summary, criticalPathCount, categories (array of {name,purpose,tests}), criticalJourneys (array), edgeCases (array), regressionChecks (array), preDemoGate (array).',
    'Cover unit, integration, end-to-end, security, accessibility, performance and failure-path testing where relevant.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Code plan: ' + JSON.stringify(codePlan || {}),
    'Integration: ' + JSON.stringify(integration || {}),
    'Quality review: ' + JSON.stringify(quality || {})
  ].join('\n')
  const parsed = parseJsonResponse(await generate(prompt), 'testing plan')
  return validateStructuredResult(parsed, ["categories"], 'testing plan')
}


export async function analyzeRepoOps(project, blueprint, architecture, codePlan, integration, quality, testing) {
  const prompt = [
    'You are a senior software engineer and repository maintainer.',
    'Turn the proposed system into an operable repository plan. Think in concrete modules, files, dependencies, implementation units and safe Git checkpoints.',
    'Do not claim to have inspected the real repository. This is a generated implementation plan based only on supplied architecture information.',
    'Return ONLY valid JSON with keys: modules (array of {name,path,responsibility,dependencies}), implementationUnits (array), dependencies (array), gitCheckpoints (array), changeImpact (array), fileChanges (array), doneCriteria (array).',
    'Prefer small reviewable changes. Include verification after risky changes.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Code plan: ' + JSON.stringify(codePlan || {}),
    'Integration: ' + JSON.stringify(integration || {}),
    'Quality: ' + JSON.stringify(quality || {}),
    'Testing: ' + JSON.stringify(testing || {})
  ].join('\n')
  const parsed = parseJsonResponse(await generate(prompt), 'repository plan')
  return validateStructuredResult(parsed, ["modules"], 'repository plan')
}


export async function analyzeDeployment(project, architecture, integration, quality, testing, repoOps) {
  const prompt = [
    'You are a senior DevOps engineer and release manager for a time-constrained hackathon.',
    'Create a safe, practical release plan from verified development work to a live application.',
    'Do not claim that deployment, build, production or environment checks have actually passed. They are planned gates.',
    'Return ONLY valid JSON with keys: releaseStatus, summary, gateCount, stages (array of {name,purpose}), environmentChecks (array), productionVerification (array), rollbackPlan (array), releaseGates (array).',
    'Keep the plan suitable for a small hackathon team and avoid unnecessary infrastructure.',
    'Project: ' + JSON.stringify(project),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Integration: ' + JSON.stringify(integration || {}),
    'Quality: ' + JSON.stringify(quality || {}),
    'Testing: ' + JSON.stringify(testing || {}),
    'Repository operations: ' + JSON.stringify(repoOps || {})
  ].join('\n')
  const parsed = parseJsonResponse(await generate(prompt), 'deployment plan')
  return validateStructuredResult(parsed, ["stages"], 'deployment plan')
}


export async function analyzePresentation(project, blueprint, architecture, experience, quality, testing, deployment) {
  const prompt = [
    'You are a senior hackathon technical presenter and product demo strategist.',
    'Create a concise, technically credible presentation and live-demo plan from the supplied project information.',
    'Focus on demonstrating the real product and engineering decisions. Do not invent features that are not in the supplied context.',
    'Return ONLY valid JSON with keys: coreMessage, demoMinutes, sections (array of {name,purpose,points}), demoSequence (array), differentiators (array), judgeTalkingPoints (array), fallbackPlan (array), likelyQuestions (array), finalGate (array).',
    'The demo should prioritize the critical user journey, one strong differentiator, technical credibility, measurable impact and a recovery path if something fails live.',
    'Project: ' + JSON.stringify(project),
    'Blueprint: ' + JSON.stringify(blueprint),
    'Architecture: ' + JSON.stringify(architecture || {}),
    'Experience: ' + JSON.stringify(experience || {}),
    'Quality: ' + JSON.stringify(quality || {}),
    'Testing: ' + JSON.stringify(testing || {}),
    'Deployment: ' + JSON.stringify(deployment || {})
  ].join('\n')
  const parsed = parseJsonResponse(await generate(prompt), 'presentation plan')
  return validateStructuredResult(parsed, ["sections"], 'presentation plan')
}
