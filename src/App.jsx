import { useState } from 'react'
import { load } from 'js-yaml'
import { Dumbbell, Activity, Target, Gauge, ChevronRight } from 'lucide-react'
import rawProgram from '../program.yaml?raw'
import { Badge, Card, CardContent, CardHeader, Separator } from './components/ui.jsx'

const program = load(rawProgram)

const labels = {
  horizontal_push: 'Horizontal Push', vertical_pull: 'Vertical Pull', horizontal_pull: 'Horizontal Pull',
  squat: 'Squat', hamstring_hinge: 'Hamstring Hinge', hamstring_curl: 'Hamstring Curl',
  leg_extension: 'Leg Extension', side_delt: 'Side Delts', rear_delt: 'Rear Delts',
  biceps: 'Biceps', triceps: 'Triceps', abs: 'Abs',
}

const muscleLabels = {
  abdominals: 'Abdominals', anterior_deltoid: 'Anterior Delts', biceps: 'Biceps', chest: 'Chest',
  forearms: 'Forearms', glutes: 'Glutes', hamstrings: 'Hamstrings', lateral_deltoid: 'Lateral Delts',
  lats: 'Lats', lower_back: 'Lower Back', middle_back: 'Middle Back', posterior_deltoid: 'Posterior Delts',
  quadriceps: 'Quadriceps', triceps: 'Triceps',
}

const anatomicalOrder = [
  'anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid',
  'chest', 'lats', 'middle_back', 'lower_back',
  'biceps', 'triceps', 'forearms',
  'abdominals', 'glutes', 'quadriceps', 'hamstrings',
]

function calculateMuscleVolume(sessions) {
  const weights = program.volume_model?.weights || { primary: 1, secondary: 0.33 }
  const volume = {}

  Object.values(sessions || {}).flat().filter((item) => !item.optional).forEach((item) => {
    const targets = program.patterns?.[item.pattern]?.targets || {}
    Object.entries(targets).forEach(([muscle, role]) => {
      if (!volume[muscle]) volume[muscle] = { primary: 0, secondary: 0, secondaryRaw: 0, total: 0 }
      const sets = Number(item.sets || 0)
      const contribution = sets * Number(weights[role] || 0)
      if (role === 'primary') volume[muscle].primary += contribution
      if (role === 'secondary') {
        volume[muscle].secondary += contribution
        volume[muscle].secondaryRaw += sets
      }
      volume[muscle].total += contribution
    })
  })

  const rank = new Map(anatomicalOrder.map((muscle, index) => [muscle, index]))
  return Object.entries(volume).sort(([a], [b]) =>
    (rank.get(a) ?? anatomicalOrder.length) - (rank.get(b) ?? anatomicalOrder.length)
  )
}

function formatSets(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function Session({ name, items }) {
  const baseSets = items.filter((item) => !item.optional).reduce((sum, item) => sum + Number(item.sets || 0), 0)
  const optionalSets = items.filter((item) => item.optional).reduce((sum, item) => sum + Number(item.sets || 0), 0)

  return <Card className="session-card"><CardHeader><div><div className="eyebrow">SESSION {name}</div><h2>Full Body {name}</h2></div><Badge>{baseSets}{optionalSets ? ` + ${optionalSets} optional` : ''} sets</Badge></CardHeader><CardContent><div className="exercise-list">
    {items.map((item, i) => <div className={`exercise${item.optional ? ' optional-exercise' : ''}`} key={`${item.pattern}-${i}`}><div className="exercise-index">{String(i + 1).padStart(2, '0')}</div><div className="exercise-main"><div className="exercise-title">{labels[item.pattern] || item.pattern}{item.optional && <span className="optional-label">optional</span>}</div><div className="exercise-meta">{program.patterns?.[item.pattern]?.examples?.slice(0, 3).join(' · ') || 'Flexible exercise selection'}</div></div><div className="prescription"><strong>{item.sets}</strong><span>sets</span></div><div className="prescription reps"><strong>{item.reps}</strong><span>reps</span></div><ChevronRight className="chevron" size={18} /></div>)}
  </div></CardContent></Card>
}

function App() {
  const [programKey, setProgramKey] = useState(program.default_program || '2d')
  const selected = program.programs[programKey]
  const volume = calculateMuscleVolume(selected.sessions)
  const maxVolume = Math.max(...volume.map(([, values]) => values.total), 1)
  const secondaryWeight = Number(program.volume_model?.weights?.secondary ?? 0.33)

  return <main className="page-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="hero"><div className="hero-mark"><Dumbbell size={22} /></div><div className="hero-copy"><div className="hero-topline"><div className="eyebrow">TRAINING / SOURCE: PROGRAM.YAML</div><div className="program-switch" role="group" aria-label="Training frequency">{Object.entries(program.programs).map(([key, variant]) => <button key={key} type="button" className={key === programKey ? 'active' : ''} onClick={() => setProgramKey(key)}>{variant.label}</button>)}</div></div><h1>{program.name}</h1><p>{selected.description}</p><div className="hero-badges"><Badge><Activity size={14} /> {selected.frequency_per_week}× / week</Badge><Badge><Target size={14} /> {program.principles.priorities.join(' · ')}</Badge><Badge><Gauge size={14} /> {program.principles.effort.compounds}</Badge></div></div></header>
    <div className="grid sessions-grid">{Object.entries(selected.sessions).map(([name, items]) => <Session key={name} name={name} items={items} />)}</div>
    <div className="grid lower-grid"><Card><CardHeader><div><div className="eyebrow">WEEKLY LOAD</div><h2>Muscle volume</h2></div><div className="volume-legend"><span><i className="legend-dot primary" />Primary</span><span><i className="legend-dot secondary" />Secondary</span></div></CardHeader><CardContent><div className="volume-list">{volume.map(([muscle, values]) => <div className="volume-item" key={muscle}><div className="volume-row"><span>{muscleLabels[muscle] || muscle.replaceAll('_', ' ')}</span><div className="volume-bar"><i className="volume-primary" style={{ width: `${(values.primary / maxVolume) * 100}%` }} /><i className="volume-secondary" style={{ width: `${(values.secondary / maxVolume) * 100}%` }} /></div><strong>{formatSets(values.total)}</strong></div><div className="volume-breakdown"><span className="primary-text">{formatSets(values.primary)} primary</span><span>+</span><span className="secondary-text">{formatSets(values.secondary)} secondary eq ({formatSets(values.secondaryRaw)} × {secondaryWeight})</span></div></div>)}</div></CardContent></Card>
      <Card><CardHeader><div><div className="eyebrow">OPERATING RULES</div><h2>Principles</h2></div></CardHeader><CardContent className="principles"><div><strong>Progression</strong><p>{program.principles.progression.rule}</p></div><Separator /><div><strong>Fatigue</strong><p>{program.principles.fatigue.rule}</p></div><Separator /><div><strong>Volume model</strong><p>Primary = 1.0, secondary = 0.33 equivalent sets. Optional work is excluded from the volume totals.</p></div></CardContent></Card></div>
    <footer><span>Generated directly from <code>program.yaml</code>.</span><span>Exercise metadata model based on Everkinetic, CC BY-SA 4.0.</span></footer>
  </main>
}

export default App
