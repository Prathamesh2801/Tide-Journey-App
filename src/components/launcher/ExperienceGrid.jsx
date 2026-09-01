import { EXPERIENCES } from '../../config/experiences'
import ExperienceCard from './ExperienceCard'

/**
 * Launcher tile grid - a symmetrical "flower" arrangement that always
 * fits the screen without scrolling.
 *
 * Portrait (the tablet held upright) uses a 2 - 1 - 2 pattern with the
 * middle tile centred; landscape uses 3 - 2 with the bottom pair
 * centred under the top row. Both are built from the same four-column
 * grid: every tile spans two columns, and the tiles that need centring
 * are offset by one column.
 *
 * The layout never reflows into a different arrangement - the tiles
 * scale instead, driven by the clamped sizes in ExperienceCard - so the
 * pattern stays recognisable in either orientation.
 */

/* Column placement per tile, portrait then landscape.
   Portrait  (4 cols): [1,2] [3,4] / [2,3] / [1,2] [3,4]
   Landscape (6 cols): [1,2] [3,4] [5,6] / [2,3] [4,5] */
const PLACEMENT = [
  'col-span-2 col-start-1          landscape:col-start-1',
  'col-span-2 col-start-3          landscape:col-start-3',
  'col-span-2 col-start-2          landscape:col-start-5',
  'col-span-2 col-start-1          landscape:col-start-2',
  'col-span-2 col-start-3          landscape:col-start-4',
]

export default function ExperienceGrid() {
  return (
    <div
      className="mx-auto grid w-full grid-cols-4 landscape:grid-cols-6"
      style={{
        maxWidth: 'min(1280px, 100%)',
        gap: 'clamp(1.25rem, 2.6vw, 2.75rem)',
      }}
    >
      {EXPERIENCES.map((experience, index) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          index={index}
          className={PLACEMENT[index]}
        />
      ))}
    </div>
  )
}
