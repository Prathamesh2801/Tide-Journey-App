import IVideoExperience from '../experiences/ivideo/IVideoExperience'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App04() {
  return (
    <ExperienceGate experienceId="app-04">
      {() => <IVideoExperience experienceId="app-04" />}
    </ExperienceGate>
  )
}
