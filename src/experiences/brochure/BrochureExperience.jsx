import { useState } from 'react'
import { getExperienceById } from '../../config/experiences'
import ScreenLayout from '../../components/layout/ScreenLayout'
import ScreenHeader from '../../components/layout/ScreenHeader'
import BackToLauncherButton from '../../components/common/BackToLauncherButton'
import MediaFallback from '../../components/media/MediaFallback'
import { BROCHURES } from '../../config/brochures'
import BrochureGrid from './components/BrochureGrid'
import BrochureReader from './components/BrochureReader'

/**
 * Root of the Brochure experience.
 *
 * Two states in one screen: the cover grid, and the reader for whichever
 * brochure was opened. Kept as local state rather than a nested route so
 * closing the reader cannot leave the launcher's history stack in an odd
 * place on a kiosk.
 */
export default function BrochureExperience({ experienceId }) {
  const experience = getExperienceById(experienceId)
  const [openBrochure, setOpenBrochure] = useState(null)

  return (
    <ScreenLayout
      fill={Boolean(openBrochure)}
      header={
        <ScreenHeader
          title={`${experience.number} · ${experience.title}`}
          subtitle={
            openBrochure
              ? experience.subtitle
              : `${BROCHURES.length} document${BROCHURES.length === 1 ? '' : 's'}`
          }
          actions={<BackToLauncherButton />}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col pb-6">
        {BROCHURES.length === 0 ? (
          <MediaFallback message="No brochures have been added yet." />
        ) : openBrochure ? (
          <BrochureReader
            brochure={openBrochure}
            onClose={() => setOpenBrochure(null)}
          />
        ) : (
          <BrochureGrid onOpen={setOpenBrochure} />
        )}
      </div>
    </ScreenLayout>
  )
}
