import ExperiencePlaceholder from '../components/common/ExperiencePlaceholder'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App04() {
  return (
    <ExperienceGate experienceId="app-04">
      {() => <ExperiencePlaceholder experienceId="app-04" />}
    </ExperienceGate>
  )
}
