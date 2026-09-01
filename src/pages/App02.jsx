import AudioExperience from '../experiences/audio/AudioExperience'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App02() {
  return (
    <ExperienceGate experienceId="app-02">
      {() => <AudioExperience experienceId="app-02" />}
    </ExperienceGate>
  )
}
