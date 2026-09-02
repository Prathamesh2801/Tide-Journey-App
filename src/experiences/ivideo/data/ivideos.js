/**
 * The adverts shown by the Television & iVideo experience, in play order.
 *
 * `name` is the filename stem in public/media/ivideo/ - the build's media
 * keep-list reads these names, so adding a film here and dropping the file
 * in that folder is all that is needed. Durations are the encoded lengths,
 * used for the runtime label so nothing has to load before it can be shown.
 */
export const IVIDEOS = [
  {
    id: "all-is-well",
    name: "all-is-well",
    title: "All Is Well",
    subtitle: "Hindi",
    duration: 25,
  },

  {
    id: "tide-shadow",
    name: "tide-shadow",
    title: "Tide Shadow",
    subtitle: "Deep Clean · new pack",
    duration: 15,
  },
  {
    id: "bigg-boss",
    name: "bigg-boss",
    title: "Bigg Boss",
    subtitle: "Television spot",
    duration: 10,
  },
];
