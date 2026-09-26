import { useMemo, useState } from 'react'
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
} from 'lucide-react'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Badge from './components/ui/Badge'
import Input from './components/ui/Input'
import { analyzeArchitecture, analyzeExperience, analyzeProblem, askOllama, isOllamaConfigured } from './services/ollama'
import './styles/design-system.css'

const navItems = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['project', 'New Project', Sparkles],
  ['blueprint', 'Blueprint', Boxes],
  ['architecture', 'Architecture', Network],
  ['stack', 'Tech Stack', Layers3],
  ['ux', 'Experience', Globe2],
  ['tasks', 'Tasks', CheckCircle2],
  ['ai', 'Local AI', BrainCircuit],
  ['quality', 'Quality', ShieldCheck],
  ['deploy', 'Deploy', Rocket],
  ['present', 'Presentation', Play],
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
  const [active, setActive] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [project, setProject] = useState({
    title: '',
    problem: '',
    users: '',
    platform: 'Web application',
    duration: '48 hours',
    teamSize: '4',
    constraints: '',
  })
  const [created, setCreated] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analysisBusy, setAnalysisBusy] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [architecture, setArchitecture] = useState(null)
  const [architectureBusy, setArchitectureBusy] = useState(false)
  const [architectureError, setArchitectureError] = useState('')
  const [experience, setExperience] = useState(null)
  const [experienceBusy, setExperienceBusy] = useState(false)
  const [experienceError, setExperienceError] = useState('')

  const blueprint = useMemo(() => buildBlueprint(project, analysis), [project, analysis])

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
    setExperienceBusy(true); setExperienceError('')
    try { setExperience(await analyzeExperience(project, blueprint, architecture, analysis)); setNotice('UI/UX and experience plan generated.') }
    catch (error) { setExperienceError(error.message); setNotice('Experience design could not be completed.') }
    finally { setExperienceBusy(false) }
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
          <span>{isOllamaConfigured() ? 'Ollama ready' : 'Ollama connector ready'}</span>
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
          {active === 'tasks' && <Tasks blueprint={blueprint} />}
          {active === 'quality' && <Quality />}
          {active === 'deploy' && <Deploy />}
          {active === 'present' && <Presentation project={project} blueprint={blueprint} />}

          {active === 'ai' && (
            <LocalAI
              prompt={aiPrompt}
              setPrompt={setAiPrompt}
              response={aiResponse}
              busy={aiBusy}
              run={runLocalAI}
              configured={isOllamaConfigured()}
            />
          )}
        </main>
      </div>
    </div>
  )
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

function IntelligenceList({ title, items = [] }) {\n  if (!items.length) return null\n  return <div className="intelligence-list"><strong>{title}</strong><ul>{items.map((item, index) => <li key={typeof item === 'string' ? item : index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul></div>\n}\n\nfunction Architecture({ blueprint, architecture, busy, error, runAnalysis }) {
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

