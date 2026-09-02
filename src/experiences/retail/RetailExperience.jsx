import { getExperienceById } from '../../config/experiences'
import ScreenLayout from '../../components/layout/ScreenLayout'
import ScreenHeader from '../../components/layout/ScreenHeader'
import BackToLauncherButton from '../../components/common/BackToLauncherButton'
import RetailVideo from './components/RetailVideo'
import { RETAIL_VIDEO } from './data/retailVideo'

/**
 * Root of the Retail experience: one looping film, nothing else.
 *
 * Takes an experience id rather than a raw path so the module owns its
 * whole screen - header, back control and player - the same way the audio
 * and brochure modules do.
 *
 * `fill` is set because the video sizes itself to the screen and needs a
 * definite height to flex against; the default centring wrapper does not
 * provide one.
 */
export default function RetailExperience({ experienceId }) {
  const experience = getExperienceById(experienceId)

  return (
    <ScreenLayout
      fill
      header={
        <ScreenHeader
          title={`${experience.number} · ${experience.title}`}
          subtitle={experience.subtitle}
          actions={<BackToLauncherButton />}
        />
      }
    >
      <div className="min-h-0 flex-1 pb-6">
        <RetailVideo name={RETAIL_VIDEO} />
      </div>
    </ScreenLayout>
  )
}
