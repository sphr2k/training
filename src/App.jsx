import { useState } from 'react'
import { load } from 'js-yaml'
import { Dumbbell, Activity, Target, Gauge, ChevronRight, Info } from 'lucide-react'
import rawProgram from '../program.yaml?raw'
import { Badge, Card, CardContent, CardHeader, Separator } from './components/ui.jsx'
import { Popover, PopoverContent, PopoverTrigger } from './components/popover.jsx'

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

const anatomeMuscles = {
  anterior_deltoid: { view: 'front', slugs: ['deltoids'] },
  lateral_deltoid: { view: 'front', slugs: ['deltoids'] },
  posterior_deltoid: { view: 'back', slugs: ['deltoids'] },
  chest: { view: 'front', slugs: ['chest'] },
  lats: { view: 'back', slugs: ['upper-back'] },
  middle_back: { view: 'back', slugs: ['trapezius', 'upper-back'] },
  lower_back: { view: 'back', slugs: ['lower-back'] },
  biceps: { view: 'front', slugs: ['biceps'] },
  triceps: { view: 'back', slugs: ['triceps'] },
  forearms: { view: 'front', slugs: ['forearm'] },
  abdominals: { view: 'front', slugs: ['abs'] },
  glutes: { view: 'back', slugs: ['gluteal'] },
  quadriceps: { view: 'front', slugs: ['quadriceps'] },
  hamstrings: { view: 'back', slugs: ['hamstring'] },
}

function MuscleDiagram({ muscle }) {
  const config = anatomeMuscles[muscle]
  if (!config) return null
  const params = new URLSearchParams({
    gender: 'male',
    view: config.view,
    layers: `38BDF8:${config.slugs.join(',')}`,
    width: '180',
    height: '240',
    body_color: '#24242a',
    border_color: '#52525b',
    background: 'transparent',
    output: 'raw',
  })
  return <img className="muscle-diagram" src={`https://api.anatome.dev/generateImage?${params.toString()}`} alt="" loading="lazy" />
}

function calculateMuscleVolume(sessions, secondaryWeight) {
  const volume = {}
  Object.entries(sessions || {}).forEach(([session, items]) => {
    items.filter((item) => !item.optional).forEach((item) => {
      const pattern = program.patterns?.[item.pattern] || {}
      Object.entries(pattern.targets || {}).forEach(([muscle, role]) => {
        if (!volume[muscle]) volume[muscle] = { primary: 0, secondary: 0, secondaryRaw: 0, total: 0, sources: [] }
        const sets = Number(item.sets || 0)
        const weight = role === 'primary' ? 1 : role === 'secondary' ? secondaryWeight : 0
        const contribution = sets * weight
        if (role === 'primary') volume[muscle].primary += contribution
        if (role === 'secondary') { volume[muscle].secondary += contribution; volume[muscle].secondaryRaw += sets }
        volume[muscle].total += contribution
        volume[muscle].sources.push({
          session,
          pattern: item.pattern,
          exercises: pattern.examples || [],
          role,
          sets,
          contribution,
        })
      })
    })
  })
  const rank = new Map(anatomicalOrder.map((muscle, index) => [muscle, index]))
  return Object.entries(volume).sort(([a], [b]) => (rank.get(a) ?? anatomicalOrder.length) - (rank.get(b) ?? anatomicalOrder.length))
}

function formatSets(value) { return Number.isInteger(value) ? String(value) : value.toFixed(1) }

function VolumeDetails({ muscle, values, secondaryWeight }) {
  return <Popover><PopoverTrigger asChild><button type="button" className="volume-breakdown" aria-label={`Show ${muscleLabels[muscle] || muscle} volume details`}><span className="primary-text">{formatSets(values.primary)} primary</span><span>+</span><span className="secondary-text">{formatSets(values.secondary)} secondary eq ({formatSets(values.secondaryRaw)} × {secondaryWeight})</span><Info size={13} /></button></PopoverTrigger><PopoverContent align="start" className="volume-popover">
    <div className="popover-heading"><MuscleDiagram muscle={muscle} /><div><div className="eyebrow">VOLUME BREAKDOWN</div><h3>{muscleLabels[muscle] || muscle}</h3></div></div>
    <p className="popover-summary">{formatSets(values.total)} equivalent sets = {formatSets(values.primary)} primary + {formatSets(values.secondary)} secondary.</p>
    <div className="source-list">{values.sources.map((source, index) => <div className="source-row" key={`${source.session}-${source.pattern}-${source.role}-${index}`}><div className="source-main"><div className="source-title"><strong>{source.exercises.join(' / ') || labels[source.pattern] || source.pattern}</strong><span>Session {source.session} · {source.role}</span></div><small>{labels[source.pattern] || source.pattern}</small></div><div className={source.role === 'primary' ? 'primary-text' : 'secondary-text'}>{source.sets} sets → {formatSets(source.contribution)} eq</div></div>)}</div>
    <Separator />
    <div className="popover-formula"><strong>Formula</strong><span>Primary × 1.0 + Secondary × {secondaryWeight}</span></div>
  </PopoverContent></Popover>
}

function Session({ name, items }) {
  const baseSets = items.filter((item) => !item.optional).reduce((sum, item) => sum + Number(item.sets || 0), 0)
  const optionalSets = items.filter((item) => item.optional).reduce((sum, item) => sum + Number(item.sets || 0), 0)
  return <Card className="session-card"><CardHeader><div><div className="eyebrow">SESSION {name}</div><h2>Full Body {name}</h2></div><Badge>{baseSets}{optionalSets ? ` + ${optionalSets} optional` : ''} sets</Badge></CardHeader><CardContent><div className="exercise-list">{items.map((item, i) => <div className={`exercise${item.optional ? ' optional-exercise' : ''}`} key={`${item.pattern}-${i}`}><div className="exercise-index">{String(i + 1).padStart(2, '0')}</div><div className="exercise-main"><div className="exercise-title">{labels[item.pattern] || item.pattern}{item.optional && <span className="optional-label">optional</span>}</div><div className="exercise-meta">{program.patterns?.[item.pattern]?.examples?.slice(0, 3).join(' · ') || 'Flexible exercise selection'}</div></div><div className="prescription"><strong>{item.sets}</strong><span>sets</span></div><div className="prescription reps"><strong>{item.reps}</strong><span>reps</span></div><ChevronRight className="chevron" size={18} /></div>)}</div></CardContent></Card>
}

function App() {
  const [programKey, setProgramKey] = useState(program.default_program || '2d')
  const [secondaryWeight, setSecondaryWeight] = useState(Number(program.volume_model?.weights?.secondary ?? 0.33))
  const selected = program.programs[programKey]
  const volume = calculateMuscleVolume(selected.sessions, secondaryWeight)
  const maxVolume = Math.max(...volume.map(([, values]) => values.total), 1)

  return <main className="page-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="hero"><div className="hero-mark"><Dumbbell size={22} /></div><div className="hero-copy"><div className="hero-topline"><div className="eyebrow">TRAINING / SOURCE: PROGRAM.YAML</div><div className="program-switch" role="group" aria-label="Training frequency">{Object.entries(program.programs).map(([key, variant]) => <button key={key} type="button" className={key === programKey ? 'active' : ''} onClick={() => setProgramKey(key)}>{variant.label}</button>)}</div></div><h1>{program.name}</h1><p>{selected.description}</p><div className="hero-badges"><Badge><Activity size={14} /> {selected.frequency_per_week}× / week</Badge><Badge><Target size={14} /> {program.principles.priorities.join(' · ')}</Badge><Badge><Gauge size={14} /> {program.principles.effort.compounds}</Badge></div></div></header>
    <div className="grid sessions-grid">{Object.entries(selected.sessions).map(([name, items]) => <Session key={name} name={name} items={items} />)}</div>
    <div className="grid lower-grid"><Card><CardHeader><div><div className="eyebrow">WEEKLY LOAD</div><h2>Muscle volume</h2></div><div className="volume-controls"><div className="volume-legend"><span><i className="legend-dot primary" />Primary</span><span><i className="legend-dot secondary" />Secondary</span></div><label className="weight-select"><span>Secondary</span><select value={secondaryWeight} onChange={(event) => setSecondaryWeight(Number(event.target.value))}><option value="0.33">× 0.33</option><option value="0.5">× 0.5</option></select></label></div></CardHeader><CardContent><div className="volume-list">{volume.map(([muscle, values]) => <div className="volume-item" key={muscle}><div className="volume-row"><span className="muscle-name"><MuscleDiagram muscle={muscle} />{muscleLabels[muscle] || muscle.replaceAll('_', ' ')}</span><div className="volume-bar"><i className="volume-primary" style={{ width: `${(values.primary / maxVolume) * 100}%` }} /><i className="volume-secondary" style={{ width: `${(values.secondary / maxVolume) * 100}%` }} /></div><strong>{formatSets(values.total)}</strong></div><VolumeDetails muscle={muscle} values={values} secondaryWeight={secondaryWeight} /></div>)}</div></CardContent></Card>
      <Card><CardHeader><div><div className="eyebrow">OPERATING RULES</div><h2>Principles</h2></div></CardHeader><CardContent className="principles"><div><strong>Progression</strong><p>{program.principles.progression.rule}</p></div><Separator /><div><strong>Fatigue</strong><p>{program.principles.fatigue.rule}</p></div><Separator /><div><strong>Volume model</strong><p>Primary = 1.0, secondary = {secondaryWeight} equivalent sets. Optional work is excluded from the volume totals.</p></div></CardContent></Card></div>
    <footer><span>Generated directly from <code>program.yaml</code>.</span><span>Exercise metadata: Everkinetic · anatomy diagrams: Anatome.</span></footer>
  </main>
}

export default App
