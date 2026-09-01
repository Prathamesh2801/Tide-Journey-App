import { getExperienceById } from '../../config/experiences'
import ScreenLayout from '../../components/layout/ScreenLayout'
import ScreenHeader from '../../components/layout/ScreenHeader'
import BackToLauncherButton from '../../components/common/BackToLauncherButton'
import MediaFallback from '../../components/media/MediaFallback'
import { useMediaTracks } from './hooks/useMediaTracks'
import AudioPlayer from './components/AudioPlayer'

/**
 * Root of an audio experience.
 *
 * Takes an experience id rather than raw media ids so the module owns its
 * whole screen - header, back control and player - the same way the Social
 * feed does. Any experience with `medium: 'audio'` can render through here
 * by pointing its page at this component.
 */
export default function AudioExperience({ experienceId }) {
  const experience = getExperienceById(experienceId)
  const tracks = useMediaTracks(experience.mediaIds)

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
      <div className="h-full pb-8">
        {tracks.length === 0 ? (
          <MediaFallback message="Loading audio…" />
        ) : (
          <AudioPlayer tracks={tracks} />
        )}
      </div>
    </ScreenLayout>
  )
}
