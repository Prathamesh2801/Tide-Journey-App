import RetailExperience from '../experiences/retail/RetailExperience'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App03() {
  return (
    <ExperienceGate experienceId="app-03">
      {() => <RetailExperience experienceId="app-03" />}
    </ExperienceGate>
  )
}
