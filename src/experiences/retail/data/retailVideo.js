/**
 * The film shown by the Retail experience.
 *
 * Named here rather than inline so swapping the clip is a one-line change:
 * drop the new file in public/media/retail/ and change this name. The
 * build's media pruner and the offline cache manifest both read this
 * value, so nothing else needs updating.
 */
export const RETAIL_VIDEO = 'tide-loop'
