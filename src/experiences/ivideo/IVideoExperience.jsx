import { getExperienceById } from '../../config/experiences'
import ScreenLayout from '../../components/layout/ScreenLayout'
import ScreenHeader from '../../components/layout/ScreenHeader'
import BackToLauncherButton from '../../components/common/BackToLauncherButton'
import MediaFallback from '../../components/media/MediaFallback'
import VideoStage from './components/VideoStage'
import VideoStrip from './components/VideoStrip'
import { useVideoCarousel } from './hooks/useVideoCarousel'
import { IVIDEOS } from './data/ivideos'

/**
 * Root of the Television & iVideo experience: a carousel of adverts.
 *
 * Takes an experience id rather than raw media so the module owns its
 * whole screen - header, back control, player and strip - matching the
 * audio, retail and brochure modules.
 *
 * `fill` is set because the stage sizes itself to the screen and needs a
 * definite height to flex against; the default centring wrapper does not
 * provide one.
 */
export default function IVideoExperience({ experienceId }) {
  const experience = getExperienceById(experienceId)
  const carousel = useVideoCarousel(IVIDEOS)

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
      {IVIDEOS.length === 0 ? (
        <MediaFallback message="No videos have been added yet." />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col pb-6">
          <div className="min-h-0 flex-1">
            <VideoStage
              video={carousel.current}
              count={IVIDEOS.length}
              index={carousel.index}
              playing={carousel.playing}
              progress={carousel.progress}
              muted={carousel.muted}
              onToggle={carousel.toggle}
              onNext={carousel.next}
              onPrevious={carousel.previous}
              onToggleMute={() => carousel.setMuted((value) => !value)}
              onSeek={carousel.seek}
              bind={carousel.bind}
            />
          </div>

          <VideoStrip
            videos={IVIDEOS}
            index={carousel.index}
            onSelect={carousel.select}
          />
        </div>
      )}
    </ScreenLayout>
  )
}
