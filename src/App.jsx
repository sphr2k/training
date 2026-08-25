import { load } from 'js-yaml'
import { Dumbbell, Activity, Target, Gauge, ChevronRight } from 'lucide-react'
import rawProgram from '../program.yaml?raw'
import { Badge, Card, CardContent, CardHeader, Separator } from './components/ui.jsx'

const program = load(rawProgram)

const labels = {
  horizontal_push: 'Horizontal Push',
  vertical_pull: 'Vertical Pull',
  horizontal_pull: 'Horizontal Pull',
  squat: 'Squat',
  hamstring_hinge: 'Hamstring Hinge',
  hamstring_curl: 'Hamstring Curl',
  leg_extension: 'Leg Extension',
  side_delt: 'Side Delts',
  rear_delt: 'Rear Delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  abs: 'Abs',
}

function Session({ name, items }) {
  const total = items.reduce((sum, item) => sum + Number(item.sets || 0), 0)
  return (
    <Card className="session-card">
      <CardHeader>
        <div>
          <div className="eyebrow">SESSION {name}</div>
          <h2>Full Body {name}</h2>
        </div>
        <Badge>{total} sets</Badge>
      </CardHeader>
      <CardContent>
        <div className="exercise-list">
          {items.map((item, i) => (
            <div className="exercise" key={`${item.pattern}-${i}`}>
              <div className="exercise-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="exercise-main">
                <div className="exercise-title">{labels[item.pattern] || item.pattern}</div>
                <div className="exercise-meta">
                  {program.patterns?.[item.pattern]?.examples?.slice(0, 3).join(' · ') || 'Flexible exercise selection'}
                </div>
                {item.note && <div className="exercise-note">{item.note}</div>}
              </div>
              <div className="prescription">
                <strong>{item.sets}</strong>
                <span>sets</span>
              </div>
              <div className="prescription reps">
                <strong>{item.reps}</strong>
                <span>reps</span>
              </div>
              <ChevronRight className="chevron" size={18} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function App() {
  const volume = Object.entries(program.weekly_volume || {})
  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero">
        <div className="hero-mark"><Dumbbell size={22} /></div>
        <div className="hero-copy">
          <div className="eyebrow">TRAINING / SOURCE: PROGRAM.YAML</div>
          <h1>{program.name}</h1>
          <p>Pattern-based hypertrophy plan with flexible exercise selection, fixed weekly structure and progression by reps, load and RIR.</p>
          <div className="hero-badges">
            <Badge><Activity size={14} /> {program.principles.frequency_per_week}× / week</Badge>
            <Badge><Target size={14} /> {program.principles.priorities.join(' · ')}</Badge>
            <Badge><Gauge size={14} /> {program.principles.effort.compounds}</Badge>
          </div>
        </div>
      </header>

      <div className="grid sessions-grid">
        <Session name="A" items={program.sessions.A} />
        <Session name="B" items={program.sessions.B} />
      </div>

      <div className="grid lower-grid">
        <Card>
          <CardHeader>
            <div>
              <div className="eyebrow">WEEKLY LOAD</div>
              <h2>Volume map</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="volume-list">
              {volume.map(([key, sets]) => (
                <div className="volume-row" key={key}>
                  <span>{labels[key] || key.replaceAll('_', ' ')}</span>
                  <div className="volume-bar"><i style={{ width: `${Math.min(100, (sets / 6) * 100)}%` }} /></div>
                  <strong>{sets}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="eyebrow">OPERATING RULES</div>
              <h2>Principles</h2>
            </div>
          </CardHeader>
          <CardContent className="principles">
            <div><strong>Progression</strong><p>{program.principles.progression.rule}</p></div>
            <Separator />
            <div><strong>Fatigue</strong><p>{program.principles.fatigue.rule}</p></div>
            <Separator />
            <div><strong>Pain</strong><p>{program.principles.pain.rule}</p></div>
          </CardContent>
        </Card>
      </div>

      <footer>
        <span>Generated directly from <code>program.yaml</code>.</span>
        <span>Exercise choice stays flexible inside each pattern.</span>
      </footer>
    </main>
  )
}

export default App
