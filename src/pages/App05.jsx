import ExperiencePlaceholder from '../components/common/ExperiencePlaceholder'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App05() {
  return (
    <ExperienceGate experienceId="app-05">
      {() => <ExperiencePlaceholder experienceId="app-05" />}
    </ExperienceGate>
  )
}
