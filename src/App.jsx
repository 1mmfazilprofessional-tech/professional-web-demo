import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Code2, Menu, Monitor, Sparkles, Zap } from 'lucide-react'
import { gsap } from 'gsap'
import './styles/design-system.css'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Badge from './components/ui/Badge'
import Input from './components/ui/Input'

function App() {
  const appRef = useRef(null)
  const motionRef = useRef(null)
  const [inputValue, setInputValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [message, setMessage] = useState('')

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Orb animation
        gsap.fromTo(
          motionRef.current,
          { y: 18, opacity: 0.45 },
          { y: -18, opacity: 1, duration: 2, repeat: -1, yoyo: true, ease: 'power1.inOut' }
        )

        // Entrance animations
        gsap.from('.nav-bar', { y: -15, opacity: 0, duration: 0.6, ease: 'power2.out' })
        gsap.from('.hero-content > *', {
          y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', delay: 0.1
        })
        gsap.from('.hero-panel', {
          opacity: 0, scale: 0.96, duration: 0.8, ease: 'power2.out', delay: 0.3
        })
        gsap.from('.section', {
          y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.4
        })
      })
    }, appRef)

    return () => ctx.revert()
  }, [])

  const handleAction = (name) => {
    setMessage(`${name} selected`)
  }

  return (
    <div className="app-shell" ref={appRef}>
      <header className="site-header">
        <div className="container nav-bar">
          <a className="brand" href="#home">
            <span className="brand-mark"><Code2 size={18} /></span>
            <span>ProUI</span>
          </a>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#showcase">Components</a>
          </nav>

          <div className="nav-actions">
            <Button variant="secondary" onClick={() => handleAction('GitHub')}>
              <Code2 size={17} />
              GitHub
            </Button>

            <button
              className="menu-button"
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container" id="home">
          <div className="hero-content">
            <Badge color="primary">
              <Sparkles size={14} />
              Developer UI System
            </Badge>

            <h1>Build interfaces that feel <span>professionally crafted.</span></h1>

            <p>
              A reusable UI foundation for modern developer products,
              combining responsive design, accessible components and smooth interaction.
            </p>

            <div className="hero-actions">
              <Button onClick={() => handleAction('Get Started')}>
                Get Started <ArrowRight size={17} />
              </Button>
              <Button variant="outline" onClick={() => handleAction('Explore Components')}>
                Explore Components
              </Button>
            </div>

            <div className="hero-meta">
              <span><CheckCircle2 size={16} /> Responsive</span>
              <span><CheckCircle2 size={16} /> Accessible</span>
              <span><CheckCircle2 size={16} /> React Ready</span>
            </div>

            {message && <p className="action-message">{message}</p>}
          </div>

          <div className="hero-panel">
            <div className="panel-glow" />
            <div className="hero-panel-content">
              <Badge color="success">System Online</Badge>
              <h2>Modern by design.</h2>
              <p>Reusable foundations ready for your next product.</p>

              <div className="mini-stats">
                <div>
                  <strong>04</strong>
                  <span>UI Components</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Responsive</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>Extendable</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section container" id="features">
          <div className="section-heading">
            <Badge color="secondary">Capabilities</Badge>
            <h2>Everything starts with a strong foundation.</h2>
            <p>Reusable pieces designed to scale from a student project to a real product.</p>
          </div>

          <div className="feature-grid">
            <Card>
              <div className="icon-box"><Code2 size={21} /></div>
              <h3>Reusable Components</h3>
              <p>Consistent buttons, cards, badges and inputs that can be reused across applications.</p>
            </Card>

            <Card>
              <div className="icon-box"><Monitor size={21} /></div>
              <h3>Responsive Design</h3>
              <p>Layouts that adapt naturally across desktop, tablet and mobile screens.</p>
            </Card>

            <Card>
              <div className="icon-box"><Zap size={21} /></div>
              <h3>Motion & Interaction</h3>
              <p>Subtle animation and feedback make interfaces feel responsive without becoming distracting.</p>
            </Card>

            <Card>
              <div className="icon-box"><Sparkles size={21} /></div>
              <h3>3D Ready</h3>
              <p>Three.js and React Three Fiber remain available for future product features where 3D adds real value.</p>
            </Card>
          </div>
        </section>

        <section className="section container" id="showcase">
          <div className="section-heading">
            <Badge color="warning">Component Lab</Badge>
            <h2>Interactive component showcase.</h2>
            <p>These are the building blocks you can reuse in future websites and products.</p>
          </div>

          <div className="showcase-grid">
            <Card>
              <span className="eyebrow">BUTTONS</span>
              <h3>Actions</h3>
              <div className="component-row">
                <Button onClick={() => handleAction('Primary')}>Primary</Button>
                <Button variant="secondary" onClick={() => handleAction('Secondary')}>Secondary</Button>
                <Button variant="outline" onClick={() => handleAction('Outline')}>Outline</Button>
                <Button disabled>Disabled</Button>
              </div>
            </Card>

            <Card>
              <span className="eyebrow">INPUT</span>
              <h3>Live interaction</h3>
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Type something..."
              />
              <p className="input-preview">
                {inputValue ? `You typed: ${inputValue}` : 'Your input will appear here.'}
              </p>
            </Card>

            <Card>
              <span className="eyebrow">STATUS</span>
              <h3>System states</h3>
              <div className="badge-row">
                <Badge color="success">Active</Badge>
                <Badge color="warning">Pending</Badge>
                <Badge color="error">Error</Badge>
              </div>
            </Card>

            <Card>
              <span className="eyebrow">MOTION</span>
              <h3>GSAP animation</h3>
              <div className="motion-stage">
                <div ref={motionRef} className="motion-orb">
                  <Sparkles size={22} />
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>ProUI - Professional Web Demo</span>
          <span>Built with React + modern UI foundations</span>
        </div>
      </footer>
    </div>
  )
}

export default App
