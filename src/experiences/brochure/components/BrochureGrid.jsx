import { BROCHURES } from '../../../config/brochures'
import BrochureCard from './BrochureCard'

/** Cover grid: every brochure at a glance, sized for touch. */
export default function BrochureGrid({ onOpen }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-5 pb-4 sm:grid-cols-3 xl:grid-cols-4">
      {BROCHURES.map((brochure, index) => (
        <BrochureCard
          key={brochure.id}
          brochure={brochure}
          index={index}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
