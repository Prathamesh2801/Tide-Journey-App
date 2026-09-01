import ExperiencePlaceholder from '../components/common/ExperiencePlaceholder'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App03() {
  return (
    <ExperienceGate experienceId="app-03">
      {() => <ExperiencePlaceholder experienceId="app-03" />}
    </ExperienceGate>
  )
}
