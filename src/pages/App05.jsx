import BrochureExperience from '../experiences/brochure/BrochureExperience'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App05() {
  return (
    <ExperienceGate experienceId="app-05">
      {() => <BrochureExperience experienceId="app-05" />}
    </ExperienceGate>
  )
}
