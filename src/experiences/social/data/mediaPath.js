// Every Social asset is resolved through here so the feed never hard-codes
// a path. When the offline media cache lands (services/media), this is the
// single function that has to start returning a cached blob URL instead.
//
// BASE_URL keeps the path correct whether the build is served from the
// XAMPP root or a subfolder.
const SOCIAL_MEDIA_BASE = `${import.meta.env.BASE_URL}media/social/`;

export function socialMediaUrl(relativePath) {
  return `${SOCIAL_MEDIA_BASE}${relativePath}`;
}
