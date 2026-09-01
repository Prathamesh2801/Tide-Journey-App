import socialArt from '../assets/images/exp-social.svg'
import audioArt from '../assets/images/exp-audio.svg'
import retailArt from '../assets/images/exp-retail.svg'
import televisionArt from '../assets/images/exp-television.svg'
import ecommerceArt from '../assets/images/exp-ecommerce.svg'

/**
 * Single source of truth for the launcher and the router.
 *
 * `medium` says what the experience is built from, so a page knows which
 * player to reach for:
 *   "feed"  - the Social reels feed (its own experience module)
 *   "video" - a single video surface
 *   "audio" - one or more audio tracks
 *   "ui"    - interactive UI, no single media file
 *
 * `mediaIds` lists entries in config/media.js. Empty means the final
 * assets have not been supplied yet.
 */
export const EXPERIENCES = [
  {
    id: 'app-01',
    number: '01',
    title: 'Social',
    subtitle: 'Instagram reels',
    route: '/app-01',
    art: socialArt,
    medium: 'feed',
    mediaIds: [],
  },
  {
    id: 'app-02',
    number: '02',
    title: 'Disruptive Social Maximization',
    subtitle: 'Two audio tracks',
    route: '/app-02',
    art: audioArt,
    medium: 'audio',
    mediaIds: ['dsm-anupama', 'dsm-himesh'],
  },
  {
    id: 'app-03',
    number: '03',
    title: 'Retail',
    subtitle: 'Video presentation',
    route: '/app-03',
    art: retailArt,
    medium: 'video',
    mediaIds: [],
  },
  {
    id: 'app-04',
    number: '04',
    title: 'Television & iVideo',
    subtitle: 'Three audio tracks',
    route: '/app-04',
    art: televisionArt,
    medium: 'audio',
    mediaIds: [],
  },
  {
    id: 'app-05',
    number: '05',
    title: 'E-commerce',
    subtitle: 'Interactive showcase',
    route: '/app-05',
    art: ecommerceArt,
    medium: 'ui',
    mediaIds: [],
  },
]

export function getExperienceById(id) {
  return EXPERIENCES.find((experience) => experience.id === id)
}
