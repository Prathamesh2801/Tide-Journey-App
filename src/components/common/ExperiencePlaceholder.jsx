import { getExperienceById } from '../../config/experiences'
import ScreenLayout from '../layout/ScreenLayout'
import ScreenHeader from '../layout/ScreenHeader'
import BackToLauncherButton from './BackToLauncherButton'
import VideoPlayer from '../media/VideoPlayer'

const MEDIUM_LABEL = {
  video: 'Video experience',
  audio: 'Audio experience',
  ui: 'Interactive experience',
}

/**
 * Temporary body for every experience page.
 *
 * Once media ids are registered in config/media.js the matching player
 * takes over; until then the screen states plainly what this module
 * will be. Each page keeps its own file so it can be built out
 * independently - this just avoids five copies of the same placeholder.
 */
export default function ExperiencePlaceholder({ experienceId }) {
  const experience = getExperienceById(experienceId)
  const [firstMediaId] = experience.mediaIds

  const renderBody = () => {
    if (experience.medium === 'video' && firstMediaId) {
      return <VideoPlayer mediaId={firstMediaId} />
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface p-10 text-center">
        <img
          src={experience.art}
          alt=""
          className="h-48 w-auto object-contain"
          draggable="false"
        />
        <div>
          <p className="text-2xl font-semibold text-text">
            {MEDIUM_LABEL[experience.medium]}
          </p>
          <p className="mt-2 text-xl text-muted">
            Content for {experience.id} has not been added yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title={`${experience.number} · ${experience.title}`}
          subtitle={experience.subtitle}
          actions={<BackToLauncherButton />}
        />
      }
    >
      <div className="h-full pb-8">{renderBody()}</div>
    </ScreenLayout>
  )
}
