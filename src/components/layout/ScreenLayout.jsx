/**
 * Full-viewport shell shared by every screen.
 * `header` and `footer` are optional slots so immersive experiences can
 * render edge-to-edge media with no chrome.
 *
 * `ambient` paints the static brand wash. It is a plain background
 * image, never animated, so it costs nothing after the first composite.
 *
 * Note the centring uses `my-auto` on the inner wrapper rather than
 * `justify-center` on the scroll container: a centred flex container
 * that overflows pushes its first child *above* the scrollable area,
 * where it can never be reached. `my-auto` centres only while there is
 * spare room and falls back to normal top-aligned scrolling once the
 * content is taller than the screen.
 */
export default function ScreenLayout({
  header,
  footer,
  ambient = false,
  children,
}) {
  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden bg-background ${
        ambient ? 'bg-brand-ambient' : ''
      }`}
    >
      {header ? (
        <header className="shrink-0 px-6 pt-6 pb-4 sm:px-10 sm:pt-8 sm:pb-6">
          {header}
        </header>
      ) : null}

      <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-10">
        <div className="my-auto flex min-h-full flex-col justify-center">
          {children}
        </div>
      </main>

      {footer ? (
        <footer className="shrink-0 px-6 pt-4 pb-6 sm:px-10 sm:pt-6 sm:pb-8">
          {footer}
        </footer>
      ) : null}
    </div>
  )
}
