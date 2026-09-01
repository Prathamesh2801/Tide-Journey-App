/**
 * Screen title block.
 * `logo` renders the brand mark on the opposite side to the title, so
 * the launcher reads as a branded home screen.
 */
export default function ScreenHeader({ title, subtitle, actions, logo }) {
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

      <div className="flex shrink-0 items-center gap-4">
        {actions}
        {logo ? (
          <img
            src={logo}
            alt="Tide"
            className="h-24 w-auto select-none"
            draggable="false"
          />
        ) : null}
      </div>
    </div>
  )
}
