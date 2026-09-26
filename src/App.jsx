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
import { analyzeProblem, askOllama, isOllamaConfigured } from './services/ollama'
import './styles/design-system.css'

const navItems = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['project', 'New Project', Sparkles],
  ['blueprint', 'Blueprint', Boxes],
  ['architecture', 'Architecture', Network],
  ['stack', 'Tech Stack', Layers3],
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

          {active === 'architecture' && <Architecture blueprint={blueprint} />}
          {active === 'stack' && <TechStack blueprint={blueprint} />}
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

function IntelligenceList({ title, items = [] }) {\n  if (!items.length) return null\n  return <div className="intelligence-list"><strong>{title}</strong><ul>{items.map((item, index) => <li key={typeof item === 'string' ? item : index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul></div>\n}\n\nfunction Architecture({ blueprint }) {
  return (
    <>
      <PageHeader eyebrow="03 / SYSTEM ARCHITECTURE" title="See the system before coding it." description="Use this as the shared technical picture for your team." />
      <div className="architecture-canvas">
        <ArchitectureNode icon={Globe2} title="Users / Browser" subtitle="Responsive UI" />
        <div className="architecture-arrow">↓</div>
        <ArchitectureNode icon={Code2} title="Frontend" subtitle="React / Vite / UI system" />
        <div className="architecture-arrow">↓</div>
        <div className="architecture-row">
          <ArchitectureNode icon={Server} title="Backend" subtitle="Node.js / API layer" />
          <ArchitectureNode icon={BrainCircuit} title="AI" subtitle="Ollama / model service" />
          <ArchitectureNode icon={Database} title="Data" subtitle="SQL / NoSQL / storage" />
        </div>
        <div className="architecture-note"><Network size={17} /> Adapt these layers to the actual problem. Current services: {blueprint.services.join(', ')}.</div>
      </div>
    </>
  )
}

function TechStack({ blueprint }) {
  return (
    <>
      <PageHeader eyebrow="04 / TECHNOLOGY STACK" title="Choose technology for the problem." description="A stack is useful only when each technology has a job." />
      <div className="stack-grid">
        {blueprint.stack.map((item) => <Card key={item.name}><div className="stack-icon">{item.icon}</div><h3>{item.name}</h3><p>{item.reason}</p><Badge color="secondary">{item.layer}</Badge></Card>)}
      </div>
    </>
  )
}

function Tasks({ blueprint }) {
  return (
    <>
      <PageHeader eyebrow="05 / DEVELOPMENT TASKS" title="Turn architecture into team work." description="Use this as the starting backlog. Split tasks among team members." />
      <div className="task-list">
        {blueprint.tasks.map((task, index) => <div className="task-row" key={task}><span className="task-check">{index + 1}</span><div><strong>{task}</strong><small>Not started · assign to a team member</small></div><Badge color={index < 2 ? 'primary' : 'secondary'}>{index < 2 ? 'Foundation' : 'Build'}</Badge></div>)}
      </div>
    </>
  )
}

function LocalAI({ prompt, setPrompt, response, busy, run, configured }) {
  return (
    <>
      <PageHeader eyebrow="06 / LOCAL AI" title="Your local coding intelligence." description="The interface is ready for Ollama. Run models on your own laptop instead of depending on a paid cloud API." />
      <div className="ai-layout">
        <Card>
          <div className="ai-status"><span className={configured ? 'status-dot' : 'status-dot warning'} /> {configured ? 'Ollama endpoint configured' : 'Ollama endpoint: http://localhost:11434'}</div>
          <h3>Ask your local developer assistant</h3>
          <textarea className="workstation-textarea ai-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Review the architecture for this project and identify missing security requirements." />
          <Button onClick={run} disabled={busy || !prompt.trim()}>{busy ? 'Thinking…' : 'Run Local AI'} <Zap size={17} /></Button>
        </Card>
        <Card>
          <div className="card-heading"><span><BrainCircuit size={17} /> AI response</span><Badge color="warning">Local</Badge></div>
          <pre className="ai-response">{response || 'Your local model response will appear here.'}</pre>
        </Card>
      </div>
      <div className="ai-model-grid">
        <Card><strong>qwen2.5-coder:7b</strong><p>Coding, debugging and implementation assistance.</p></Card>
        <Card><strong>llama3.1:8b</strong><p>Problem analysis, planning and general reasoning.</p></Card>
      </div>
    </>
  )
}

function Quality() {
  return (
    <>
      <PageHeader eyebrow="07 / QUALITY GATE" title="Check before you present." description="A professional project is more than a working screen." />
      <div className="quality-grid">
        {[
          ['Accessibility', 'Keyboard navigation, labels, contrast and reduced motion.', ShieldCheck],
          ['Security', 'Input validation, authentication boundaries and secret handling.', ShieldCheck],
          ['Performance', 'Bundle size, loading states, images and unnecessary work.', Zap],
          ['Testing', 'Critical flows, API errors and responsive behavior.', TestTube2],
          ['Code quality', 'Reusable components, clear naming and maintainable structure.', Code2],
          ['Demo readiness', 'A reliable 2–5 minute story with a clear problem and result.', Play],
        ].map(([title, text, Icon]) => <Card key={title}><div className="icon-box"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></Card>)}
      </div>
    </>
  )
}

function Deploy() {
  return (
    <>
      <PageHeader eyebrow="08 / SHIP" title="Prepare the release." description="Deployment remains under your control; the workstation organizes the steps." />
      <div className="release-flow">
        {[
          ['Build', 'npm run build'],
          ['Verify', 'npm run lint + test'],
          ['Git', 'Commit → branch → pull request'],
          ['Deploy', 'GitHub Pages / Vercel / Netlify'],
          ['Domain', 'Configure custom domain when required'],
          ['Verify', 'Open production URL and test critical flows'],
        ].map(([title, command], index) => <Card key={title}><span className="pipeline-number">0{index + 1}</span><h3>{title}</h3><code>{command}</code></Card>)}
      </div>
    </>
  )
}

function Presentation({ project, blueprint }) {
  return (
    <>
      <PageHeader eyebrow="09 / PRESENTATION" title="Tell the story like an engineer." description="Turn your technical work into a clear demo for judges, faculty and teammates." />
      <div className="presentation-grid">
        <Card><span className="eyebrow">01 · PROBLEM</span><h2>{project.problem || 'Your problem statement'}</h2><p>Who has this problem and why does it matter?</p></Card>
        <Card><span className="eyebrow">02 · SOLUTION</span><h2>{project.title || 'Your solution'}</h2><p>Show the core workflow rather than listing every feature.</p></Card>
        <Card><span className="eyebrow">03 · TECHNICAL</span><h2>{blueprint.stack.slice(0, 3).map((item) => item.name).join(' · ')}</h2><p>Explain why each major technology was selected.</p></Card>
        <Card><span className="eyebrow">04 · LIVE DEMO</span><h2>Problem → product → result</h2><p>Keep a reliable path through the most valuable user journey.</p></Card>
      </div>
    </>
  )
}

function BlueprintCard({ title, icon: Icon, items }) {
  return <Card><div className="card-heading"><span><Icon size={17} /> {title}</span><ArrowRight size={16} /></div><ul className="clean-list">{items.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul></Card>
}

function ArchitectureNode({ icon: Icon, title, subtitle }) {
  return <div className="architecture-node"><div className="architecture-icon"><Icon size={21} /></div><strong>{title}</strong><small>{subtitle}</small></div>
}

function Metric({ label, value }) {
  return <Card><span className="metric-value">{value}</span><span className="metric-label">{label}</span></Card>
}

function buildBlueprint(project, analysis = null) {
  const problem = project.problem || 'Define the problem statement to generate a project-specific blueprint.'
  if (analysis) {
    return {
      problem: analysis.problemUnderstanding?.summary || project.problem,
      features: (analysis.mvpFeatures || []).map((item) => item.name),
      screens: analysis.recommendedScreens || [],
      services: analysis.recommendedServices || [],
      stack: [
        { name: 'React + Vite', reason: 'Fast component-based frontend for a hackathon web product.', layer: 'Frontend', icon: 'UI' },
        { name: 'Node.js API', reason: 'A clear service boundary for business logic and integrations.', layer: 'Backend', icon: 'API' },
        { name: 'PostgreSQL / Supabase', reason: 'Use structured persistence when the problem needs relational data.', layer: 'Data', icon: 'DB' },
        { name: 'Ollama', reason: 'Local AI capability without a paid model API.', layer: 'AI', icon: 'AI' },
      ],
      tasks: (analysis.nextActions || []).map((name, index) => ({ name, owner: index % 2 === 0 ? 'Product / Frontend' : 'Backend / AI', priority: index < 3 ? 'High' : 'Medium' })),
    }
  }

  return {
    problem,
    features: ['Core user workflow', 'Authentication / role control when required', 'Responsive dashboard or primary experience', 'Validation, error and loading states', 'Analytics or reporting where useful'],
    screens: ['Landing / entry', 'Authentication', 'Main application workspace', 'Details / workflow screen', 'Settings / profile'],
    services: ['Frontend application', 'Backend API', 'Database / storage', 'Authentication', 'AI service when useful'],
    tasks: ['Clarify requirements and success criteria', 'Create project skeleton and design system', 'Build primary user workflow', 'Implement backend/API and data layer', 'Integrate frontend with services', 'Add quality, security and accessibility checks', 'Prepare GitHub, deployment and demo'],
    stack: [
      { name: 'React + Vite', layer: 'Frontend', reason: 'Fast component-based development for a modern web interface.', icon: '⚛' },
      { name: 'Node.js + API', layer: 'Backend', reason: 'A practical JavaScript backend for REST APIs and rapid hackathon iteration.', icon: '⬢' },
      { name: 'PostgreSQL / Supabase', layer: 'Data', reason: 'Use relational data when the problem needs structured, connected records.', icon: '◈' },
      { name: 'Ollama', layer: 'AI', reason: 'Run local models for planning and coding assistance without a paid API.', icon: 'AI' },
      { name: 'Three.js / WebGL', layer: 'Experience', reason: 'Use real-time 3D only when visualization or interaction improves the solution.', icon: '3D' },
      { name: 'GSAP', layer: 'Motion', reason: 'Create controlled, purposeful interface motion and presentation sequences.', icon: '↗' },
    ],
  }
}

export default App
