/**
 * Screen title block.
 *
 * Two layouts, chosen by whether a `logo` is supplied:
 *
 *   with logo (the launcher)  -  logo left, title centred, actions right
 *   without    (experiences)  -  title left, actions right
 *
 * The centred variant gives the two side slots an equal fixed basis so
 * the title is centred against the *screen*, not against whatever space
 * the logo and buttons happen to leave. Centring with `justify-between`
 * alone drifts off-centre as soon as the two sides differ in width.
 */
export default function ScreenHeader({ title, subtitle, actions, logo, onBand = false }) {
  if (logo) {
    return (
      <div className="flex items-center gap-4">
        {/* Left: brand mark. */}
        <div className="flex shrink-0 basis-32 justify-start sm:basis-40">
          <img
            src={logo}
            alt="Tide"
            className="h-20 w-auto select-none sm:h-24"
            draggable="false"
          />
        </div>

        {/* Centre: title. min-w-0 lets a long title wrap instead of
            shoving the side slots out of alignment. */}
        <div className="min-w-0 flex-1 text-center">
          <h1
            className={`text-4xl font-bold tracking-tight sm:text-5xl ${
              onBand ? 'text-white' : 'text-primary'
            }`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={`mt-2 text-lg sm:text-xl ${
                onBand ? 'text-white/85' : 'text-muted'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Right: actions, mirroring the logo's basis. */}
        <div className="flex shrink-0 basis-32 items-center justify-end gap-4 sm:basis-40">
          {actions}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-8">
      <div className="min-w-0">
        <h1 className="text-5xl font-bold tracking-tight text-primary">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-xl text-muted">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-4">{actions}</div>
    </div>
  )
}
