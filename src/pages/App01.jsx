import SocialFeedExperience from '../experiences/social/SocialFeedExperience'
import ExperienceGate from '../components/common/ExperienceGate'

export default function App01() {
  return (
    <ExperienceGate experienceId="app-01">
      {() => <SocialFeedExperience />}
    </ExperienceGate>
  )
}
