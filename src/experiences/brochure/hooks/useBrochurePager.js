import { useCallback, useEffect, useState } from 'react'

/**
 * Page position for a brochure, plus keyboard support.
 *
 * `page` and `direction` are kept in one state object so a page change
 * and the slide direction it implies are always applied together - two
 * separate setState calls could otherwise animate the wrong way for a
 * frame.
 */
export function useBrochurePager(pageCount) {
  const [{ page, direction }, setState] = useState({ page: 1, direction: 1 })

  const goTo = useCallback(
    (target) => {
      setState((current) => {
        const clamped = Math.min(pageCount, Math.max(1, target))
        if (clamped === current.page) return current
        return { page: clamped, direction: clamped > current.page ? 1 : -1 }
      })
    },
    [pageCount]
  )

  const next = useCallback(() => goTo(page + 1), [goTo, page])
  const previous = useCallback(() => goTo(page - 1), [goTo, page])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, previous])

  return {
    page,
    direction,
    goTo,
    next,
    previous,
    isFirst: page <= 1,
    isLast: page >= pageCount,
  }
}
