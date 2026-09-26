import { Component, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Accessibility,
  MousePointer2,
  LayoutDashboard,
  Menu,
  Network,
  Play,
  Rocket,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TestTube2,
  X,
  Zap,

  AlertTriangle,
  Braces,
  Bug,
  FileCode2,
  FolderTree,
  Gauge,
  GitCommitHorizontal,
  HelpCircle,
  ListChecks,
  LockKeyhole,
  MessageSquare,
  Package,
  PlayCircle,
  Presentation,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  ShieldAlert,
  Target,
  Terminal,
  Wrench,
} from 'lucide-react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Badge from './components/ui/Badge'
import Input from './components/ui/Input'
import { analyzeArchitecture, analyzeExperience, analyzeCodePlan, analyzeProblem, askOllama, checkOllamaHealth, isOllamaConfigured } from './services/ollama'
import './styles/design-system.css'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error.',
    }
  }

  componentDidCatch(error) {
    console.error('DevStation runtime error:', error)
  }

  handleRecovery = () => {
    this.setState({ hasError: false, message: '' })
  }

  handleReset = () => {
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY)
    } catch {}
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px' }}>
        <Card>
          <div className="card-heading">
            <span><ShieldAlert size={18} /> DevStation recovered a runtime error</span>
            <Badge color="danger">Recovery mode</Badge>
          </div>
          <p>The application stopped rendering one part of the workstation safely instead of leaving a blank page.</p>
          <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>{this.state.message}</pre>
          <div className="hero-actions">
            <Button onClick={this.handleRecovery}><RotateCcw size={16} /> Try again</Button>
            <Button variant="outline" onClick={this.handleReset}><RefreshCw size={16} /> Reset local workspace</Button>
          </div>
        </Card>
      </main>
    )
  }
}

const WORKSPACE_STORAGE_KEY = 'devstation.workspace.v1'

function loadWorkspace() {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveWorkspace(snapshot) {
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

const navItems = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['project', 'New Project', Sparkles],
  ['blueprint', 'Blueprint', Boxes],
  ['architecture', 'Architecture', Network],
  ['stack', 'Tech Stack', Layers3],
  ['ux', 'Experience', Globe2],
  ['code', 'Code Lab', Code2],
  ['integration', 'Integration', Network],
  ['debug', 'Debugging', Bug],
  ['quality', 'Quality & Security', ShieldCheck],
  ['testing', 'Testing', TestTube2],
  ['repo', 'Repo & Code Ops', GitBranch],
  ['deploy', 'Release', Rocket],
  ['present', 'Presentation', Presentation],
  ['tasks', 'Tasks', CheckCircle2],
  ['ai', 'Local AI', BrainCircuit],
]

const stageItems = [
  ['Problem', 'Define the real problem and users.'],
  ['Blueprint', 'Turn the idea into requirements and features.'],
  ['Architecture', 'Design frontend, backend, data and APIs.'],
  ['Build', 'Organize implementation into practical tasks.'],
  ['Quality', 'Test accessibility, security and performance.'],
  ['Ship', 'Prepare GitHub, deployment and presentation.'],
]

function App() {
  const [active, setActive] = useState(() => loadWorkspace()?.active || 'dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const savedWorkspace = loadWorkspace()
  const [project, setProject] = useState(() => savedWorkspace?.project || {
    title: '',
    problem: '',
    users: '',
    platform: 'Web application',
    duration: '48 hours',
    teamSize: '4',
    constraints: '',
  })
  const [created, setCreated] = useState(() => Boolean(savedWorkspace?.created))
  const [ollamaHealth, setOllamaHealth] = useState({ ok: false, model: 'qwen2.5-coder:7b', error: 'Not checked yet.' })
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [analysis, setAnalysis] = useState(() => savedWorkspace?.analysis ?? null)
  const [analysisBusy, setAnalysisBusy] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [architecture, setArchitecture] = useState(() => savedWorkspace?.architecture ?? null)
  const [architectureBusy, setArchitectureBusy] = useState(false)
  const [architectureError, setArchitectureError] = useState('')
  const [experience, setExperience] = useState(() => savedWorkspace?.experience ?? null)
  const [experienceBusy, setExperienceBusy] = useState(false)
  const [experienceError, setExperienceError] = useState('')
  const [codePlan, setCodePlan] = useState(() => savedWorkspace?.codePlan ?? null)
  const [codeBusy, setCodeBusy] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [integration, setIntegration] = useState(() => savedWorkspace?.integration ?? null)
  const [integrationBusy, setIntegrationBusy] = useState(false)
  const [integrationError, setIntegrationError] = useState('')
  const [debugInput, setDebugInput] = useState(() => savedWorkspace?.debugInput ?? '')
  const [debugResult, setDebugResult] = useState(() => savedWorkspace?.debugResult ?? null)
  const [debugBusy, setDebugBusy] = useState(false)
  const [debugError, setDebugError] = useState('')
  const [quality, setQuality] = useState(() => savedWorkspace?.quality ?? null)
  const [qualityBusy, setQualityBusy] = useState(false)
  const [qualityError, setQualityError] = useState('')
  const [testing, setTesting] = useState(() => savedWorkspace?.testing ?? null)
  const [testingBusy, setTestingBusy] = useState(false)
  const [testingError, setTestingError] = useState('')
  const [repoOps, setRepoOps] = useState(() => savedWorkspace?.repoOps ?? null)
  const [repoOpsBusy, setRepoOpsBusy] = useState(false)
  const [repoOpsError, setRepoOpsError] = useState('')
  const [deployment, setDeployment] = useState(() => savedWorkspace?.deployment ?? null)
  const [deploymentBusy, setDeploymentBusy] = useState(false)
  const [deploymentError, setDeploymentError] = useState('')
  const [presentation, setPresentation] = useState(() => savedWorkspace?.presentation ?? null)
  const [presentationBusy, setPresentationBusy] = useState(false)
  const [presentationError, setPresentationError] = useState('')

  const blueprint = useMemo(() => buildBlueprint(project, analysis), [project, analysis])

  useEffect(() => {
    saveWorkspace({
      active,
      project,
      created,
      analysis,
      architecture,
      experience,
      codePlan,
      integration,
      debugInput,
      debugResult,
      quality,
      testing,
      repoOps,
      deployment,
      presentation,
    })
  }, [active, project, created, analysis, architecture, experience, codePlan, integration, debugInput, debugResult, quality, testing, repoOps, deployment, presentation])

  useEffect(() => {
    checkOllamaHealth().then(setOllamaHealth)
  }, [])

  const go = (section) => {
    setActive(section)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const runProblemAnalysis = async () => {
    if (!project.problem.trim()) {
      setNotice('Add a problem statement before running intelligence analysis.')
      return
    }
    setAnalysisBusy(true)
    setAnalysisError('')
    try {
      const result = await analyzeProblem(project)
      setAnalysis(result)
      setNotice('Problem Intelligence completed. The blueprint is now based on your project analysis.')
    } catch (error) {
      setAnalysisError(error.message)
      setNotice('Problem analysis could not be completed.')
    } finally {
      setAnalysisBusy(false)
    }
  }

  const runArchitectureAnalysis = async () => {
    if (!project.problem.trim()) {
      setNotice('Create a project problem before generating architecture.')
      return
    }
    if (!analysis) { setNotice('Run Problem Intelligence first so architecture uses evidence from the project.'); setActive('project'); return }
    setArchitectureBusy(true)
    setArchitectureError('')
    try {
      const result = await analyzeArchitecture(project, blueprint, analysis)
      setArchitecture(result)
      setNotice('Technical Architecture generated from the current blueprint.')
    } catch (error) {
      setArchitectureError(error.message)
      setNotice('Architecture generation could not be completed.')
    } finally {
      setArchitectureBusy(false)
    }
  }

  const runExperienceAnalysis = async () => {
    if (!project.problem.trim()) { setNotice('Create a project problem before designing the experience.'); return }
    if (!analysis || !architecture) { setNotice('Complete Problem Intelligence and Architecture before designing the experience.'); return }
    setExperienceBusy(true); setExperienceError('')
    try { setExperience(await analyzeExperience(project, blueprint, architecture, analysis)); setNotice('UI/UX and experience plan generated.') }
    catch (error) { setExperienceError(error.message); setNotice('Experience design could not be completed.') }
    finally { setExperienceBusy(false) }
  }

  const runCodePlanning = async () => {
    if (!project.problem.trim()) { setNotice('Create a project before generating the implementation plan.'); return }
    if (!analysis || !architecture || !experience) { setNotice('Complete Problem Intelligence, Architecture and Experience before planning code.'); return }
    setCodeBusy(true); setCodeError('')
    try { setCodePlan(await analyzeCodePlan(project, blueprint, architecture, experience)); setNotice('Implementation plan generated from the architecture and UX.') }
    catch (error) { setCodeError(error.message); setNotice('Code planning could not be completed.') }
    finally { setCodeBusy(false) }
  }

  const runIntegrationAnalysis = async () => {
    if (!project.problem.trim()) { setNotice('Create a project before checking integration.'); return }
    if (!architecture || !experience || !codePlan) { setNotice('Complete Architecture, Experience and Code Lab before checking integration.'); return }
    setIntegrationBusy(true); setIntegrationError('')
    try { setIntegration(await analyzeIntegration(project, blueprint, architecture, experience, codePlan)); setNotice('Integration map and connection checks generated.') }
    catch (error) { setIntegrationError(error.message); setNotice('Integration analysis could not be completed.') }
    finally { setIntegrationBusy(false) }
  }

  const runDebugAnalysis = async () => {
    if (!debugInput.trim()) { setDebugError('Paste an error, stack trace, failing behavior, or test failure first.'); return }
    setDebugBusy(true); setDebugError('')
    try { setDebugResult(await analyzeError(debugInput, project, architecture, codePlan, integration)); setNotice('Error intelligence analysis completed.') }
    catch (error) { setDebugError(error.message); setNotice('Debug analysis could not be completed.') }
    finally { setDebugBusy(false) }
  }

  const runQualityAnalysis = async () => {
    if (!project.problem.trim()) { setQualityError('Create a project before running the quality review.'); return }
    if (!analysis || !architecture || !experience || !codePlan || !integration) { setQualityError('Complete the upstream engineering stages before running Quality & Security.'); return }
    setQualityBusy(true); setQualityError('')
    try { setQuality(await analyzeQuality(project, blueprint, architecture, experience, codePlan, integration)); setNotice('Quality and security review completed.') }
    catch (error) { setQualityError(error.message); setNotice('Quality review could not be completed.') }
    finally { setQualityBusy(false) }
  }

  const runTestingAnalysis = async () => {
    if (!project.problem.trim()) { setTestingError('Create a project before generating the verification plan.'); return }
    if (!quality || !integration) { setTestingError('Complete Integration and Quality & Security before generating verification.'); return }
    setTestingBusy(true); setTestingError('')
    try { setTesting(await analyzeTesting(project, blueprint, architecture, experience, codePlan, integration, quality)); setNotice('Testing and verification plan generated.') }
    catch (error) { setTestingError(error.message); setNotice('Testing plan could not be completed.') }
    finally { setTestingBusy(false) }
  }

  const runRepoOpsAnalysis = async () => {
    if (!project.problem.trim()) { setRepoOpsError('Create a project before generating repository operations.'); return }
    if (!testing || !quality || !codePlan) { setRepoOpsError('Complete Code Lab, Quality & Security and Testing before repository operations.'); return }
    setRepoOpsBusy(true); setRepoOpsError('')
    try { setRepoOps(await analyzeRepoOps(project, blueprint, architecture, codePlan, integration, quality, testing)); setNotice('Repository and implementation operations generated.') }
    catch (error) { setRepoOpsError(error.message); setNotice('Repository operations could not be generated.') }
    finally { setRepoOpsBusy(false) }
  }

  const runDeploymentAnalysis = async () => {
    if (!project.problem.trim()) { setDeploymentError('Create a project before generating the release plan.'); return }
    if (!repoOps || !testing || !quality) { setDeploymentError('Complete Repository Ops, Testing and Quality & Security before release planning.'); return }
    setDeploymentBusy(true); setDeploymentError('')
    try { setDeployment(await analyzeDeployment(project, architecture, integration, quality, testing, repoOps)); setNotice('Deployment and release plan generated.') }
    catch (error) { setDeploymentError(error.message); setNotice('Deployment planning could not be completed.') }
    finally { setDeploymentBusy(false) }
  }

  const runPresentationAnalysis = async () => {
    if (!project.problem.trim()) { setPresentationError('Create a project before generating the demo plan.'); return }
    if (!deployment || !testing || !quality) { setPresentationError('Complete Release, Testing and Quality & Security before preparing the final demo.'); return }
    setPresentationBusy(true); setPresentationError('')
    try { setPresentation(await analyzePresentation(project, blueprint, architecture, experience, quality, testing, deployment)); setNotice('Presentation and demo plan generated.') }
    catch (error) { setPresentationError(error.message); setNotice('Presentation planning could not be completed.') }
    finally { setPresentationBusy(false) }
  }

  const createProject = (event) => {
    event.preventDefault()
    if (!project.problem.trim()) {
      setNotice('Add a problem statement first.')
      return
    }
    setCreated(true)
    setNotice('Project workspace created locally in this session.')
    setActive('blueprint')
  }

  const runLocalAI = async () => {
    if (!aiPrompt.trim()) return
    setAiBusy(true)
    setAiResponse('')
    try {
      const response = await askOllama(aiPrompt, project)
      setAiResponse(response)
    } catch (error) {
      setAiResponse(error.message)
    } finally {
      setAiBusy(false)
    }
  }

  return (
    <div className="workstation-shell">
      <header className="workstation-header">
        <div className="workstation-brand">
          <button className="brand" onClick={() => go('dashboard')} aria-label="Open dashboard">
            <span className="brand-mark"><TerminalSquare size={18} /></span>
            <span>DevStation</span>
          </button>
          <Badge color="success"><span className="status-dot" /> LOCAL WORKSPACE</Badge>
        </div>

        <div className="header-status">
          <span><Activity size={15} /> Developer mode</span>
          <span>{ollamaHealth.ok ? `Ollama connected · ${ollamaHealth.model}` : 'Ollama needs local proxy'}</span>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label="Toggle workstation navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className="workstation-layout">
        <aside className={`workstation-sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-label">WORKSPACE</div>
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`sidebar-item ${active === id ? 'active' : ''}`}
              onClick={() => go(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
          <div className="sidebar-divider" />
          <button className="sidebar-item" onClick={() => setNotice('Settings foundation is ready for future preferences.')}>
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
        </aside>

        <main className="workstation-main">
          {notice && <div className="workstation-notice" role="status">{notice}</div>}

          {active === 'dashboard' && (
            <Dashboard project={project} created={created} go={go} />
          )}

          {active === 'project' && (
            <ProjectForm project={project} setProject={setProject} onSubmit={createProject} />
          )}

          {active === 'blueprint' && (
            <Blueprint blueprint={blueprint} project={project} created={created} analysis={analysis} analysisBusy={analysisBusy} analysisError={analysisError} runAnalysis={runProblemAnalysis} />
          )}

          {active === 'architecture' && <Architecture blueprint={blueprint} architecture={architecture} busy={architectureBusy} error={architectureError} runAnalysis={runArchitectureAnalysis} />}
          {active === 'stack' && <TechStack blueprint={blueprint} />}
          {active === 'ux' && <Experience blueprint={blueprint} architecture={architecture} experience={experience} busy={experienceBusy} error={experienceError} runAnalysis={runExperienceAnalysis} />}
          {active === 'code' && <CodeLab blueprint={blueprint} architecture={architecture} experience={experience} codePlan={codePlan} busy={codeBusy} error={codeError} runAnalysis={runCodePlanning} />}
          {active === 'integration' && <Integration blueprint={blueprint} architecture={architecture} codePlan={codePlan} integration={integration} busy={integrationBusy} error={integrationError} runAnalysis={runIntegrationAnalysis} />}
          {active === 'debug' && <Debugging debugInput={debugInput} setDebugInput={setDebugInput} result={debugResult} busy={debugBusy} error={debugError} runAnalysis={runDebugAnalysis} />}
          {active === 'quality' && <QualitySecurity quality={quality} busy={qualityBusy} error={qualityError} runAnalysis={runQualityAnalysis} />}
          {active === 'testing' && <Testing testing={testing} busy={testingBusy} error={testingError} runAnalysis={runTestingAnalysis} />}
          {active === 'repo' && <RepoOps repoOps={repoOps} busy={repoOpsBusy} error={repoOpsError} runAnalysis={runRepoOpsAnalysis} />}
          {active === 'deploy' && <Deployment deployment={deployment} busy={deploymentBusy} error={deploymentError} runAnalysis={runDeploymentAnalysis} />}
          {active === 'present' && <PresentationDemo presentation={presentation} busy={presentationBusy} error={presentationError} runAnalysis={runPresentationAnalysis} />}
          {active === 'tasks' && <Tasks blueprint={blueprint} />}

          {active === 'ai' && (
            <LocalAI
              prompt={aiPrompt}
              setPrompt={setAiPrompt}
              response={aiResponse}
              busy={aiBusy}
              run={runLocalAI}
              configured={ollamaHealth.ok}
            />
          )}
        </main>
      </div>
    </div>
  )
}


function Metric({ label, value }) {
  return (
    <Card>
      <div className="metric-card">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </Card>
  )
}

function BlueprintCard({ title, icon: Icon, items = [] }) {
  return (
    <Card>
      <div className="card-heading"><span><Icon size={17} /> {title}</span><Badge color="secondary">Blueprint</Badge></div>
      <ul className="clean-list">
        {items.filter(Boolean).map((item, index) => <li key={index}><CheckCircle2 size={15} /> <span>{item}</span></li>)}
      </ul>
    </Card>
  )
}

function ArchitectureNode({ icon: Icon, title, subtitle }) {
  return (
    <div className="architecture-node">
      <div className="architecture-icon"><Icon size={19} /></div>
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </div>
  )
}

function TechStack({ blueprint }) {
  const items = [
    ['Frontend', blueprint.platform === '3D / immersive web' ? 'React + Three.js / WebGL' : 'React + Vite'],
    ['State', 'React state + local persistence'],
    ['Styling', 'CSS design system'],
    ['AI', 'Local Ollama when needed'],
    ['Data', blueprint.services.includes('Database') ? 'Database selected by architecture' : 'Browser storage / no database required'],
  ]
  return (
    <>
      <PageHeader eyebrow="TECH STACK" title="Choose technology from the problem." description="The stack should follow the product constraints, not the other way around." />
      <div className="dashboard-grid">
        {items.map(([name, value]) => (
          <Card key={name}><div className="card-heading"><span><Layers3 size={17} /> {name}</span></div><p>{value}</p></Card>
        ))}
      </div>
    </>
  )
}

function Tasks({ blueprint }) {
  const tasks = blueprint.tasks || []
  return (
    <>
      <PageHeader eyebrow="IMPLEMENTATION TASKS" title="Work in a clear execution order." description="Break the blueprint into small, verifiable engineering tasks." />
      <div className="pipeline-grid">
        {tasks.map((task, index) => {
          const name = typeof task === 'string' ? task : task.name
          const detail = typeof task === 'string' ? 'Implementation task' : task.detail
          return <Card key={index}><div className="pipeline-number">0{index + 1}</div><h3>{name}</h3><p>{detail}</p></Card>
        })}
      </div>
    </>
  )
}

function LocalAI({ prompt, setPrompt, response, busy, run, configured }) {
  return (
    <>
      <PageHeader eyebrow="LOCAL AI" title="Use your laptop's local model." description="Send focused engineering questions to Ollama through the local workstation proxy." />
      {!configured && (
        <Card>
          <div className="card-heading"><span><AlertTriangle size={17} /> Local AI connection</span><Badge color="warning">Needs attention</Badge></div>
          <p>Start Ollama and run <code>local-ai-proxy/start-proxy.bat</code>, then reload this page. The workstation will not claim the connection is ready until the local proxy responds.</p>
        </Card>
      )}
      <Card>
        <div className="card-heading"><span><BrainCircuit size={17} /> Ollama</span><Badge color={configured ? 'success' : 'warning'}>{configured ? 'Configured' : 'Not configured'}</Badge></div>
        <textarea className="workstation-textarea" rows="6" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask for architecture reasoning, debugging help, implementation guidance, or a critical review..." />
        <div className="hero-actions"><Button onClick={run} disabled={busy || !prompt.trim()}>{busy ? 'Thinking…' : 'Ask Local AI'} <BrainCircuit size={17} /></Button></div>
        {response && <div className="ai-response"><pre>{response}</pre></div>}
      </Card>
    </>
  )
}

function buildBlueprint(project, analysis) {
  const problem = project.problem.trim() || 'Define the problem statement before building.'
  const features = analysis?.mvpFeatures?.map((item) => item.name) || [
    'Core problem-solving workflow',
    'Input validation and useful feedback',
    'Responsive interface',
    'Clear success and error states',
  ]
  const screens = analysis?.recommendedScreens || [
    'Home / Overview',
    'Primary workflow',
    'Results / Status',
    'Settings / Help',
  ]

  const durationText = String(project.duration || '').toLowerCase()
  const shortHackathon = /hour|minute/.test(durationText) && !/24|48|72/.test(durationText)
  const problemRequiresServer = /multi-user|shared|real-time|remote data|external api|payment|authentication|login|admin|server|backend|database|ai model|ollama/i.test(problem)
  const explicitlyRecommended = analysis?.serviceDecisions?.filter((item) => item?.needed).map((item) => item.service).filter(Boolean) || []

  let services
  if (!problemRequiresServer && (shortHackathon || explicitlyRecommended.length === 0)) {
    services = ['Frontend application', 'Browser storage', 'Validation and local business logic']
  } else {
    services = analysis?.recommendedServices?.length
      ? analysis.recommendedServices
      : ['Frontend application', ...explicitlyRecommended]
  }

  if (!problemRequiresServer && services.some((item) => /database|api|backend|server|auth|ai|model/i.test(item))) {
    services = ['Frontend application', 'Browser storage', 'Validation and local business logic']
  }

  const tasks = [
    { name: 'Validate the problem and MVP scope', detail: 'Confirm the target user, critical workflow and measurable outcome.' },
    { name: 'Build the core user flow', detail: 'Implement the smallest complete path from input to useful result.' },
    { name: 'Add states and validation', detail: 'Handle loading, empty, success, error and edge cases.' },
    { name: 'Test the critical path', detail: 'Verify the main journey across desktop and mobile.' },
    { name: 'Prepare the release', detail: 'Run build checks, publish and verify the deployed experience.' },
  ]
  return { problem, features, screens, services, tasks }
}
function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function Dashboard({ project, created, go }) {
  return (
    <>
      <PageHeader
        eyebrow="DEVELOPER WORKSTATION"
        title="Build the solution, not just the website."
        description="Start with a real problem. DevStation organizes the engineering work from idea to deployment and presentation."
        action={<Button onClick={() => go('project')}>New Project <ArrowRight size={17} /></Button>}
      />

      <div className="hero-workspace">
        <div>
          <Badge color="primary"><Sparkles size={14} /> Hackathon-ready workflow</Badge>
          <h2>{created ? project.title || 'Your active project' : 'What are you building?'}</h2>
          <p>{created ? project.problem : 'Enter a university or hackathon problem and turn it into an actionable engineering plan.'}</p>
          <div className="hero-actions">
            <Button onClick={() => go(created ? 'blueprint' : 'project')}>
              {created ? 'Open Blueprint' : 'Start a Project'} <ArrowRight size={17} />
            </Button>
            <Button variant="outline" onClick={() => go('ai')}><BrainCircuit size={17} /> Local AI</Button>
          </div>
        </div>
        <div className="system-visual">
          <div className="system-orbit orbit-one" />
          <div className="system-orbit orbit-two" />
          <div className="system-core"><Code2 size={28} /></div>
          <span className="system-node node-a">UI</span>
          <span className="system-node node-b">API</span>
          <span className="system-node node-c">DB</span>
          <span className="system-node node-d">AI</span>
        </div>
      </div>

      <div className="section-title-row"><h2>Engineering pipeline</h2><span>6 stages</span></div>
      <div className="pipeline-grid">
        {stageItems.map(([name, description], index) => (
          <Card key={name}>
            <div className="pipeline-number">0{index + 1}</div>
            <h3>{name}</h3>
            <p>{description}</p>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading"><span><GitBranch size={17} /> Project control</span><Badge color="secondary">Ready</Badge></div>
          <p>Keep the problem, architecture, tasks, quality checks and deployment plan in one workspace.</p>
        </Card>
        <Card>
          <div className="card-heading"><span><BrainCircuit size={17} /> Local intelligence</span><Badge color="warning">Ollama</Badge></div>
          <p>Connect the workstation to your local coding models without requiring a paid AI API.</p>
        </Card>
        <Card>
          <div className="card-heading"><span><Rocket size={17} /> Ship confidently</span><Badge color="success">Controlled</Badge></div>
          <p>Prepare GitHub and deployment steps while keeping final account actions under your control.</p>
        </Card>
      </div>
    </>
  )
}

function ProjectForm({ project, setProject, onSubmit }) {
  const update = (key, value) => setProject((current) => ({ ...current, [key]: value }))
  return (
    <>
      <PageHeader eyebrow="01 / NEW PROJECT" title="Give the workstation the problem." description="The problem statement is the starting point. Everything else is derived from it." />
      <form className="project-form" onSubmit={onSubmit}>
        <Card>
          <div className="form-section">
            <Badge color="primary">Problem</Badge>
            <label>Project title <Input value={project.title} onChange={(e) => update('title', e.target.value)} placeholder="Example: Smart Campus Issue Reporter" /></label>
            <label>Problem statement <textarea className="workstation-textarea" value={project.problem} onChange={(e) => update('problem', e.target.value)} placeholder="Describe the problem your team must solve..." required /></label>
            <label>Target users <Input value={project.users} onChange={(e) => update('users', e.target.value)} placeholder="Students, faculty, local businesses..." /></label>
          </div>
        </Card>
        <div className="form-side">
          <Card>
            <div className="form-section">
              <Badge color="secondary">Context</Badge>
              <label>Platform <select value={project.platform} onChange={(e) => update('platform', e.target.value)}><option>Web application</option><option>Web + mobile</option><option>Dashboard</option><option>3D / immersive web</option></select></label>
              <label>Hackathon duration <Input value={project.duration} onChange={(e) => update('duration', e.target.value)} /></label>
              <label>Team size <Input value={project.teamSize} onChange={(e) => update('teamSize', e.target.value)} /></label>
              <label>Constraints <textarea className="workstation-textarea compact" value={project.constraints} onChange={(e) => update('constraints', e.target.value)} placeholder="Budget, APIs, hardware, offline requirements..." /></label>
              <Button type="submit">Create Project Workspace <ArrowRight size={17} /></Button>
            </div>
          </Card>
        </div>
      </form>
    </>
  )
}

function Blueprint({ blueprint, project, created, analysis, analysisBusy, analysisError, runAnalysis }) {
  return (
    <>
      <PageHeader eyebrow="02 / PROJECT BLUEPRINT" title={created ? project.title || 'Project Blueprint' : 'Project Blueprint'} description="A structured plan that turns the problem into engineering decisions." />
      <div className="intelligence-panel">
        <div>
          <Badge color="primary"><BrainCircuit size={14} /> Problem Intelligence Engine</Badge>
          <h2>Challenge the problem before building the solution.</h2>
          <p>Use local AI to identify root causes, users, risks, edge cases, MVP scope and differentiated opportunities. The result becomes the source for the next engineering stages.</p>
        </div>
        <Button onClick={runAnalysis} disabled={analysisBusy || !project.problem.trim()}>
          {analysisBusy ? 'Analyzing problem…' : analysis ? 'Re-analyze Problem' : 'Analyze Problem'} <Sparkles size={17} />
        </Button>
      </div>
      {analysisError && <div className="analysis-error" role="alert">{analysisError}</div>}
      {analysis && (
        <div className="intelligence-grid">
          <Card><div className="card-heading"><span><Sparkles size={17} /> Problem understanding</span><Badge color="success">AI analyzed</Badge></div><p>{analysis.problemUnderstanding?.summary}</p><IntelligenceList title="Root causes" items={analysis.problemUnderstanding?.rootCauses} /><IntelligenceList title="Risks" items={analysis.problemUnderstanding?.risks} /></Card>
          <Card><div className="card-heading"><span><Boxes size={17} /> MVP features</span></div><ul className="clean-list">{(analysis.mvpFeatures || []).map((item) => <li key={item.name}><CheckCircle2 size={15} /> <span><strong>{item.name}</strong> — {item.reason}</span></li>)}</ul></Card>
          <Card><div className="card-heading"><span><Zap size={17} /> Innovation opportunities</span></div><ul className="clean-list">{(analysis.innovations || []).map((item) => <li key={item.name}><Sparkles size={15} /> <span><strong>{item.name}</strong> — {item.value} <Badge color={item.complexity === 'high' ? 'warning' : 'secondary'}>{item.complexity}</Badge></span></li>)}</ul></Card>
          <Card><div className="card-heading"><span><ShieldCheck size={17} /> Edge cases & constraints</span></div><IntelligenceList title="Edge cases" items={analysis.edgeCases} /><IntelligenceList title="Constraints" items={analysis.constraints} /></Card>
          <Card><div className="card-heading"><span><Rocket size={17} /> Recommended next actions</span></div><IntelligenceList items={analysis.nextActions} /></Card>
          <Card><div className="card-heading"><span><ShieldCheck size={17} /> Avoid for now</span><Badge color="warning">Scope control</Badge></div><IntelligenceList items={analysis.avoidForNow} /></Card>
        </div>
      )}
      <div className="metric-grid">
        <Metric label="Features" value={analysis?.mvpFeatures?.length || blueprint.features.length} />
        <Metric label="Screens" value={analysis?.recommendedScreens?.length || blueprint.screens.length} />
        <Metric label="Services" value={analysis?.recommendedServices?.length || blueprint.services.length} />
        <Metric label="Delivery stages" value={blueprint.tasks.length} />
      </div>
      <div className="blueprint-grid">
        <BlueprintCard title="Problem understanding" icon={Sparkles} items={[blueprint.problem, `Users: ${project.users || 'To be defined'}`, `Platform: ${project.platform}`]} />
        <BlueprintCard title="Core features" icon={Boxes} items={blueprint.features} />
        <BlueprintCard title="Application screens" icon={LayoutDashboard} items={blueprint.screens} />
        <BlueprintCard title="Engineering services" icon={Server} items={blueprint.services} />
      </div>
    </>
  )
}

function IntelligenceList({ title, items = [] }) {
  if (!items.length) return null
  return <div className="intelligence-list"><strong>{title}</strong><ul>{items.map((item, index) => <li key={typeof item === 'string' ? item : index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul></div>
}

function Architecture({ blueprint, architecture, busy, error, runAnalysis }) {
  const layers = architecture?.layers || [
    { name: 'Frontend', technology: 'React + Vite', responsibility: 'User interface, routing, state and user interactions.', connectsTo: ['API Layer'] },
    { name: 'API Layer', technology: 'REST / Node.js', responsibility: 'Validation, business logic and service orchestration.', connectsTo: ['Database', 'AI Service'] },
    { name: 'Database', technology: 'PostgreSQL / Supabase', responsibility: 'Persistent application data and relationships.', connectsTo: ['API Layer'] },
    { name: 'AI Service', technology: 'Ollama', responsibility: 'Local model inference for AI-specific workflows.', connectsTo: ['API Layer'] },
  ]
  return (
    <>
      <PageHeader eyebrow="03 / SYSTEM ARCHITECTURE" title="Design the system before coding it." description="Generate a problem-specific technical architecture and inspect how every major layer connects." action={<Button onClick={runAnalysis} disabled={busy || !blueprint.problem}>{busy ? 'Designing architecture…' : architecture ? 'Regenerate Architecture' : 'Generate Architecture'} <Network size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      <div className="architecture-canvas">
        <div className="architecture-flow">
          {layers.map((layer, index) => (
            <div key={layer.name}>
              <div className="architecture-node architecture-node-rich">
                <div className="architecture-icon"><Layers3 size={21} /></div>
                <strong>{layer.name}</strong>
                <small>{layer.technology}</small>
                <p>{layer.responsibility}</p>
                {layer.connectsTo?.length ? <div className="architecture-connections">→ {layer.connectsTo.join(' · ')}</div> : null}
              </div>
              {index < layers.length - 1 && <div className="architecture-arrow">↓</div>}
            </div>
          ))}
        </div>
        <div className="architecture-row">
          <ArchitectureNode icon={Globe2} title="Users / Browser" subtitle="Responsive experience" />
          <ArchitectureNode icon={Server} title="Service Boundary" subtitle="APIs + validation" />
          <ArchitectureNode icon={Database} title="Persistent Data" subtitle="Storage + relationships" />
          <ArchitectureNode icon={BrainCircuit} title="AI Capability" subtitle="Local model / AI APIs" />
        </div>
        {architecture && (
          <div className="architecture-detail-grid">
            <Card><div className="card-heading"><span><Network size={17} /> Data flow</span><Badge color="success">Generated</Badge></div><ol className="clean-list">{(architecture.dataFlow || []).map((item) => <li key={item}><ArrowRight size={15} /> {item}</li>)}</ol></Card>
            <Card><div className="card-heading"><span><ShieldCheck size={17} /> Security boundaries</span></div><ul className="clean-list">{(architecture.security || []).map((item) => <li key={item}><ShieldCheck size={15} /> {item}</li>)}</ul></Card>
            <Card><div className="card-heading"><span><Zap size={17} /> Failure handling</span></div><ul className="clean-list">{(architecture.failureHandling || []).map((item) => <li key={item}><Activity size={15} /> {item}</li>)}</ul></Card>
            <Card><div className="card-heading"><span><GitBranch size={17} /> Project structure</span></div><ul className="clean-list">{(architecture.projectStructure || []).map((item) => <li key={item}><Code2 size={15} /> {item}</li>)}</ul></Card>
          </div>
        )}
        <div className="architecture-note"><Network size={17} /> Blueprint services: {blueprint.services.join(', ') || 'Generate a blueprint first.'}</div>
      </div>
    </>
  )
}

function Experience({ blueprint, architecture, experience, busy, error, runAnalysis }) {
  const screens = experience?.screens || blueprint.screens.map((name) => ({ name, purpose: 'Deliver the relevant user workflow.', primaryAction: 'Continue', states: ['Loading', 'Empty', 'Success', 'Error'] }))
  return (
    <>
      <PageHeader eyebrow="04 / EXPERIENCE ENGINE" title="Design the product people will actually use." description="Turn the blueprint and architecture into user flows, screen behavior, interaction states and purposeful visual experiences." action={<Button onClick={runAnalysis} disabled={busy || !blueprint.problem}>{busy ? 'Designing experience…' : experience ? 'Regenerate Experience' : 'Design Experience'} <Globe2 size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {experience && <div className="experience-summary"><Badge color="success">Generated</Badge><h2>{experience.experiencePrinciples?.join(' · ')}</h2><p>{experience.primaryUserFlow?.join(' → ')}</p></div>}
      <div className="experience-grid">{screens.map((screen) => (
        <Card key={screen.name}><div className="card-heading"><span><LayoutDashboard size={17} /> {screen.name}</span><Badge color="secondary">Screen</Badge></div><p>{screen.purpose}</p><div className="experience-meta"><strong>Primary action</strong><span>{screen.primaryAction}</span></div><IntelligenceList title="States" items={screen.states} /></Card>
      ))}</div>
      {experience && <div className="experience-detail-grid">
        <Card><div className="card-heading"><span><MousePointer2 size={17} /> Interaction rules</span></div><IntelligenceList items={experience.interactionRules} /></Card>
        <Card><div className="card-heading"><span><Accessibility size={17} /> Accessibility</span></div><IntelligenceList items={experience.accessibility} /></Card>
        <Card><div className="card-heading"><span><Zap size={17} /> Motion & advanced visuals</span></div><IntelligenceList items={experience.motionAndVisuals} /></Card>
        <Card><div className="card-heading"><span><ShieldCheck size={17} /> UX failure states</span></div><IntelligenceList items={experience.failureStates} /></Card>
      </div>}
      <div className="experience-note"><Sparkles size={17} /> Architecture-aware: {architecture ? `${architecture.layers?.length || 0} system layers considered.` : 'Generate architecture first for deeper UX decisions.'}</div>
    </>
  )
}

function CodeLab({ blueprint, architecture, experience, codePlan, busy, error, runAnalysis }) {
  const files = codePlan?.files || [
    { path: 'src/', purpose: 'Application source code' },
    { path: 'src/components/', purpose: 'Reusable UI components' },
    { path: 'src/services/', purpose: 'API and integration services' },
    { path: 'src/pages/', purpose: 'Feature-level screens' },
    { path: 'tests/', purpose: 'Automated quality checks' },
  ]
  return (
    <>
      <PageHeader eyebrow="05 / CODE LAB" title="Turn architecture into an implementation plan." description="Generate a concrete file map, implementation sequence, interfaces and acceptance criteria before code is written." action={<Button onClick={runAnalysis} disabled={busy || !blueprint.problem}>{busy ? 'Planning implementation…' : codePlan ? 'Regenerate Code Plan' : 'Generate Code Plan'} <Code2 size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      <div className="code-lab-grid">
        <Card><div className="card-heading"><span><FolderTree size={17} /> Project file map</span><Badge color="secondary">{files.length} areas</Badge></div><div className="file-tree">{files.map((file) => <div className="file-row" key={file.path}><Code2 size={15} /><strong>{file.path}</strong><span>{file.purpose}</span></div>)}</div></Card>
        <Card><div className="card-heading"><span><ListChecks size={17} /> Implementation sequence</span></div><IntelligenceList items={codePlan?.implementationOrder || blueprint.tasks.map((t) => typeof t === 'string' ? t : t.name)} /></Card>
      </div>
      {codePlan && <div className="code-detail-grid">
        <Card><div className="card-heading"><span><Braces size={17} /> Core interfaces</span></div><IntelligenceList items={codePlan.coreInterfaces} /></Card>
        <Card><div className="card-heading"><span><CheckCircle2 size={17} /> Acceptance criteria</span></div><IntelligenceList items={codePlan.acceptanceCriteria} /></Card>
        <Card><div className="card-heading"><span><Bug size={17} /> High-risk areas</span><Badge color="warning">Review</Badge></div><IntelligenceList items={codePlan.riskAreas} /></Card>
        <Card><div className="card-heading"><span><GitBranch size={17} /> Git checkpoints</span></div><IntelligenceList items={codePlan.gitCheckpoints} /></Card>
      </div>}
      <div className="code-lab-note"><Sparkles size={17} /> This stage plans implementation. The next stage will connect generated implementation tasks to an actual code workspace and integration checks.</div>
    </>
  )
}


function Integration({ blueprint, architecture, codePlan, integration, busy, error, runAnalysis }) {
  const connections = integration?.connections || [
    { from: 'Frontend', to: 'Backend API', contract: 'HTTP/JSON', status: 'Planned' },
    { from: 'Backend API', to: 'Database', contract: 'Validated data access', status: 'Planned' },
    { from: 'Backend API', to: 'AI Service', contract: 'Model request/response', status: 'Planned' },
    { from: 'Authentication', to: 'Frontend + Backend', contract: 'Session / token boundary', status: 'Review' },
  ]
  return (
    <>
      <PageHeader eyebrow="06 / INTEGRATION ENGINE" title="Make every part of the system connect correctly." description="Trace interfaces between layers, identify missing contracts and expose integration risks before they become hackathon-day failures." action={<Button onClick={runAnalysis} disabled={busy || !blueprint.problem}>{busy ? 'Checking connections…' : integration ? 'Recheck Integration' : 'Check Integration'} <Network size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {integration && <div className="integration-score"><div><Badge color={integration.overallStatus === 'Ready' ? 'success' : 'warning'}>{integration.overallStatus || 'Review'}</Badge><h2>{integration.summary}</h2></div><div className="integration-counts"><strong>{integration.readyCount ?? 0}</strong><span>ready</span><strong>{integration.reviewCount ?? 0}</strong><span>review</span></div></div>}
      <div className="integration-flow">{connections.map((item) => <Card key={item.from + item.to}><div className="integration-connection"><div><strong>{item.from}</strong><small>{item.contract}</small></div><ArrowRight size={20} /><div><strong>{item.to}</strong><Badge color={item.status === 'Ready' ? 'success' : item.status === 'Planned' ? 'secondary' : 'warning'}>{item.status}</Badge></div></div></Card>)}</div>
      {integration && <div className="integration-detail-grid">
        <Card><div className="card-heading"><span><AlertTriangle size={17} /> Missing contracts</span></div><IntelligenceList items={integration.missingContracts} /></Card>
        <Card><div className="card-heading"><span><ShieldCheck size={17} /> Integration risks</span></div><IntelligenceList items={integration.risks} /></Card>
        <Card><div className="card-heading"><span><TestTube2 size={17} /> Verification checks</span></div><IntelligenceList items={integration.verificationChecks} /></Card>
        <Card><div className="card-heading"><span><RefreshCw size={17} /> Change impact</span></div><IntelligenceList items={integration.changeImpact} /></Card>
      </div>}
      <div className="integration-note"><GitBranch size={17} /> Integration is evaluated against {architecture?.layers?.length || 0} architecture layers and {codePlan?.files?.length || 0} planned code areas.</div>
    </>
  )
}


function Debugging({ debugInput, setDebugInput, result, busy, error, runAnalysis }) {
  return (
    <>
      <PageHeader eyebrow="07 / DEBUG INTELLIGENCE" title="Find the cause, not just the error." description="Paste a stack trace, compiler error, failed test, API response or observed bug and let the local model reason through the failure." action={<Button onClick={runAnalysis} disabled={busy || !debugInput.trim()}>{busy ? 'Investigating…' : 'Investigate Error'} <Bug size={17} /></Button>} />
      <Card>
        <div className="card-heading"><span><Terminal size={17} /> Failure input</span><Badge color="secondary">Local AI</Badge></div>
        <textarea className="debug-input" value={debugInput} onChange={(event) => setDebugInput(event.target.value)} placeholder="Paste the error message, stack trace, failing API response, test output, or describe the unexpected behavior…" rows="8" />
        {error && <div className="analysis-error" role="alert">{error}</div>}
      </Card>
      {result && <div className="debug-result-grid">
        <Card><div className="card-heading"><span><Target size={17} /> Classification</span><Badge color="warning">{result.category || 'Unknown'}</Badge></div><p>{result.summary}</p><div className="debug-kv"><strong>Severity</strong><span>{result.severity}</span><strong>Confidence</strong><span>{result.confidence}</span></div></Card>
        <Card><div className="card-heading"><span><Search size={17} /> Root-cause hypotheses</span></div><IntelligenceList items={result.rootCauseHypotheses} /></Card>
        <Card><div className="card-heading"><span><GitBranch size={17} /> Likely affected areas</span></div><IntelligenceList items={result.affectedAreas} /></Card>
        <Card><div className="card-heading"><span><Wrench size={17} /> Recommended fix</span></div><IntelligenceList items={result.fixPlan} /></Card>
        <Card><div className="card-heading"><span><TestTube2 size={17} /> Verification</span></div><IntelligenceList items={result.verificationSteps} /></Card>
        <Card><div className="card-heading"><span><ShieldCheck size={17} /> Regression prevention</span></div><IntelligenceList items={result.regressionPrevention} /></Card>
      </div>}
    </>
  )
}


function QualitySecurity({ quality, busy, error, runAnalysis }) {
  const domains = quality?.domains || [
    { name: 'Security', status: 'Review', findings: ['Authentication and authorization boundaries', 'Input validation and API exposure', 'Secrets and environment configuration'] },
    { name: 'Accessibility', status: 'Review', findings: ['Keyboard navigation', 'Semantic structure', 'Focus and contrast'] },
    { name: 'Performance', status: 'Review', findings: ['Bundle size and network requests', 'Rendering and expensive interactions', 'Caching and loading states'] },
    { name: 'Reliability', status: 'Review', findings: ['Error handling', 'Failure recovery', 'External service resilience'] },
  ]
  return (
    <>
      <PageHeader eyebrow="08 / QUALITY & SECURITY" title="Find weaknesses before the judges or users do." description="Review the planned system for security, accessibility, performance, reliability, maintainability and hackathon delivery risk." action={<Button onClick={runAnalysis} disabled={busy}>{busy ? 'Reviewing system…' : quality ? 'Run Review Again' : 'Run Quality Review'} <ShieldCheck size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {quality && <div className="quality-summary"><div><Badge color={quality.overallStatus === 'Ready' ? 'success' : 'warning'}>{quality.overallStatus || 'Review'}</Badge><h2>{quality.summary}</h2></div><div className="quality-score"><strong>{quality.riskCount ?? 0}</strong><span>priority risks</span></div></div>}
      <div className="quality-domain-grid">{domains.map((domain) => <Card key={domain.name}><div className="card-heading"><span><ShieldCheck size={17} /> {domain.name}</span><Badge color={domain.status === 'Ready' ? 'success' : 'warning'}>{domain.status}</Badge></div><IntelligenceList items={domain.findings} /></Card>)}</div>
      {quality && <div className="quality-detail-grid">
        <Card><div className="card-heading"><span><AlertTriangle size={17} /> Priority risks</span></div><IntelligenceList items={quality.priorityRisks} /></Card>
        <Card><div className="card-heading"><span><Wrench size={17} /> Remediation tasks</span></div><IntelligenceList items={quality.remediationTasks} /></Card>
        <Card><div className="card-heading"><span><Gauge size={17} /> Performance checks</span></div><IntelligenceList items={quality.performanceChecks} /></Card>
        <Card><div className="card-heading"><span><LockKeyhole size={17} /> Security checks</span></div><IntelligenceList items={quality.securityChecks} /></Card>
      </div>}
    </>
  )
}


function Testing({ testing, busy, error, runAnalysis }) {
  const categories = testing?.categories || [
    { name: 'Unit', purpose: 'Verify isolated business logic and utilities.', tests: ['Core calculations', 'Validation rules', 'Error handling'] },
    { name: 'Integration', purpose: 'Verify service and API boundaries.', tests: ['API contracts', 'Database operations', 'Authentication boundaries'] },
    { name: 'End-to-End', purpose: 'Verify critical user journeys.', tests: ['Primary user flow', 'Failure recovery', 'Responsive behavior'] },
    { name: 'Security', purpose: 'Verify security-sensitive behavior.', tests: ['Unauthorized access', 'Input abuse', 'Secret exposure'] },
  ]
  return (
    <>
      <PageHeader eyebrow="09 / TESTING ENGINE" title="Prove the system works before the demo." description="Generate a practical test strategy from the actual architecture, integration boundaries and identified risks." action={<Button onClick={runAnalysis} disabled={busy}>{busy ? 'Designing tests…' : testing ? 'Regenerate Test Plan' : 'Generate Test Plan'} <TestTube2 size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {testing && <div className="testing-summary"><div><Badge color={testing.overallStatus === 'Demo Ready' ? 'success' : 'warning'}>{testing.overallStatus || 'Review'}</Badge><h2>{testing.summary}</h2></div><div><strong>{testing.criticalPathCount ?? 0}</strong><span> critical-path checks</span></div></div>}
      <div className="testing-category-grid">{categories.map((category) => <Card key={category.name}><div className="card-heading"><span><TestTube2 size={17} /> {category.name}</span><Badge color="secondary">Tests</Badge></div><p>{category.purpose}</p><IntelligenceList items={category.tests} /></Card>)}</div>
      {testing && <div className="testing-detail-grid">
        <Card><div className="card-heading"><span><Route size={17} /> Critical user journeys</span></div><IntelligenceList items={testing.criticalJourneys} /></Card>
        <Card><div className="card-heading"><span><AlertTriangle size={17} /> Edge cases</span></div><IntelligenceList items={testing.edgeCases} /></Card>
        <Card><div className="card-heading"><span><RefreshCw size={17} /> Regression checks</span></div><IntelligenceList items={testing.regressionChecks} /></Card>
        <Card><div className="card-heading"><span><CheckCircle2 size={17} /> Pre-demo gate</span></div><IntelligenceList items={testing.preDemoGate} /></Card>
      </div>}
    </>
  )
}


function RepoOps({ repoOps, busy, error, runAnalysis }) {
  const modules = repoOps?.modules || [
    { name: 'Frontend', path: 'src/components/', responsibility: 'UI and feature components', dependencies: 'Design system + services' },
    { name: 'Services', path: 'src/services/', responsibility: 'API and external integrations', dependencies: 'Environment + contracts' },
    { name: 'Tests', path: 'tests/', responsibility: 'Automated verification', dependencies: 'Application modules' },
    { name: 'Configuration', path: 'config / env', responsibility: 'Build and runtime configuration', dependencies: 'Deployment environment' },
  ]
  return (
    <>
      <PageHeader eyebrow="10 / REPO & CODE OPS" title="Turn the plan into an operable codebase." description="Map implementation units, dependencies, Git checkpoints and change impact before code is edited." action={<Button onClick={runAnalysis} disabled={busy}>{busy ? 'Mapping repository…' : repoOps ? 'Regenerate Repo Plan' : 'Generate Repo Plan'} <GitBranch size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      <div className="repo-module-grid">{modules.map((module) => <Card key={module.name}><div className="card-heading"><span><FolderTree size={17} /> {module.name}</span><Badge color="secondary">{module.path}</Badge></div><p>{module.responsibility}</p><small className="repo-dependency">Depends on: {module.dependencies}</small></Card>)}</div>
      {repoOps && <div className="repo-detail-grid">
        <Card><div className="card-heading"><span><ListChecks size={17} /> Implementation units</span></div><IntelligenceList items={repoOps.implementationUnits} /></Card>
        <Card><div className="card-heading"><span><Package size={17} /> Dependencies</span></div><IntelligenceList items={repoOps.dependencies} /></Card>
        <Card><div className="card-heading"><span><GitCommitHorizontal size={17} /> Git checkpoints</span></div><IntelligenceList items={repoOps.gitCheckpoints} /></Card>
        <Card><div className="card-heading"><span><RefreshCw size={17} /> Change impact</span></div><IntelligenceList items={repoOps.changeImpact} /></Card>
        <Card><div className="card-heading"><span><FileCode2 size={17} /> Suggested file changes</span></div><IntelligenceList items={repoOps.fileChanges} /></Card>
        <Card><div className="card-heading"><span><CheckCircle2 size={17} /> Done criteria</span></div><IntelligenceList items={repoOps.doneCriteria} /></Card>
      </div>}
      <div className="repo-note"><GitBranch size={17} /> This stage plans repository operations. It does not silently modify source code; actual edits remain reviewable and verifiable.</div>
    </>
  )
}


function Deployment({ deployment, busy, error, runAnalysis }) {
  const stages = deployment?.stages || [
    { name: 'Preflight', purpose: 'Validate dependencies, environment variables and build configuration.' },
    { name: 'Build', purpose: 'Create a production build and catch compile/lint failures.' },
    { name: 'Deploy', purpose: 'Publish the verified build through the selected deployment target.' },
    { name: 'Verify', purpose: 'Check the live URL, critical flows, APIs and assets.' },
  ]
  return (
    <>
      <PageHeader eyebrow="11 / RELEASE ENGINE" title="Ship safely, not just quickly." description="Plan the path from verified code to a working live product, including environment checks, deployment verification and recovery." action={<Button onClick={runAnalysis} disabled={busy}>{busy ? 'Planning release…' : deployment ? 'Regenerate Release Plan' : 'Generate Release Plan'} <Rocket size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {deployment && <div className="release-summary"><div><Badge color={deployment.releaseStatus === 'Ready' ? 'success' : 'warning'}>{deployment.releaseStatus || 'Review'}</Badge><h2>{deployment.summary}</h2></div><div><strong>{deployment.gateCount ?? 0}</strong><span> release gates</span></div></div>}
      <div className="release-stage-grid">{stages.map((stage, index) => <Card key={stage.name}><div className="release-stage-number">0{index + 1}</div><div className="card-heading"><span><Rocket size={17} /> {stage.name}</span></div><p>{stage.purpose}</p></Card>)}</div>
      {deployment && <div className="release-detail-grid">
        <Card><div className="card-heading"><span><Settings2 size={17} /> Environment checks</span></div><IntelligenceList items={deployment.environmentChecks} /></Card>
        <Card><div className="card-heading"><span><CheckCircle2 size={17} /> Production verification</span></div><IntelligenceList items={deployment.productionVerification} /></Card>
        <Card><div className="card-heading"><span><RotateCcw size={17} /> Rollback / recovery</span></div><IntelligenceList items={deployment.rollbackPlan} /></Card>
        <Card><div className="card-heading"><span><ShieldCheck size={17} /> Release gates</span></div><IntelligenceList items={deployment.releaseGates} /></Card>
      </div>}
      <div className="release-note"><Rocket size={17} /> A release plan is not a deployment claim. The workstation will require actual build and live verification before calling a release ready.</div>
    </>
  )
}


function PresentationDemo({ presentation, busy, error, runAnalysis }) {
  const sections = presentation?.sections || [
    { name: 'Opening', purpose: 'State the problem, affected users and why it matters.', points: ['Problem in one sentence', 'Target user', 'Measurable impact'] },
    { name: 'Solution', purpose: 'Show the product solving the problem, not slides describing it.', points: ['Core workflow', 'Key differentiator', 'Outcome'] },
    { name: 'Technical Story', purpose: 'Explain architecture and engineering decisions briefly.', points: ['Architecture', 'AI / data / APIs', 'Security and reliability'] },
    { name: 'Live Demo', purpose: 'Demonstrate the strongest critical path with a controlled sequence.', points: ['Happy path', 'One advanced feature', 'Visible result'] },
  ]
  return (
    <>
      <PageHeader eyebrow="12 / PRESENTATION & DEMO" title="Turn the finished build into a convincing technical story." description="Generate a judge-friendly narrative, live-demo sequence, technical explanation and fallback plan from the actual project." action={<Button onClick={runAnalysis} disabled={busy}>{busy ? 'Building demo plan…' : presentation ? 'Regenerate Demo Plan' : 'Generate Demo Plan'} <Presentation size={17} /></Button>} />
      {error && <div className="analysis-error" role="alert">{error}</div>}
      {presentation && <div className="presentation-summary"><div><Badge color="success">Demo plan</Badge><h2>{presentation.coreMessage}</h2></div><div><strong>{presentation.demoMinutes ?? 5}</strong><span> minutes</span></div></div>}
      <div className="presentation-section-grid">{sections.map((section, index) => <Card key={section.name}><div className="presentation-number">0{index + 1}</div><div className="card-heading"><span><Presentation size={17} /> {section.name}</span></div><p>{section.purpose}</p><IntelligenceList items={section.points} /></Card>)}</div>
      {presentation && <div className="presentation-detail-grid">
        <Card><div className="card-heading"><span><PlayCircle size={17} /> Demo sequence</span></div><IntelligenceList items={presentation.demoSequence} /></Card>
        <Card><div className="card-heading"><span><Sparkles size={17} /> Differentiators</span></div><IntelligenceList items={presentation.differentiators} /></Card>
        <Card><div className="card-heading"><span><MessageSquare size={17} /> Judge talking points</span></div><IntelligenceList items={presentation.judgeTalkingPoints} /></Card>
        <Card><div className="card-heading"><span><ShieldAlert size={17} /> Demo fallback</span></div><IntelligenceList items={presentation.fallbackPlan} /></Card>
        <Card><div className="card-heading"><span><HelpCircle size={17} /> Likely questions</span></div><IntelligenceList items={presentation.likelyQuestions} /></Card>
        <Card><div className="card-heading"><span><CheckCircle2 size={17} /> Final demo gate</span></div><IntelligenceList items={presentation.finalGate} /></Card>
      </div>}
    </>
  )
}

function AppWithRecovery() {\n  return (\n    <AppErrorBoundary>\n      <App />\n    </AppErrorBoundary>\n  )\n}\n\nexport default AppWithRecovery