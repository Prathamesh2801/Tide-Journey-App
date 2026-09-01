import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Launcher from '../pages/Launcher'
import NotFound from '../pages/NotFound'
import LoadingScreen from '../components/common/LoadingScreen'

/**
 * The launcher is bundled eagerly so it starts instantly on the tablet.
 * Each experience is a separate chunk, so heavy modules and media
 * logic are only fetched when that experience is opened.
 */
const App01 = lazy(() => import('../pages/App01'))
const App02 = lazy(() => import('../pages/App02'))
const App03 = lazy(() => import('../pages/App03'))
const App04 = lazy(() => import('../pages/App04'))
const App05 = lazy(() => import('../pages/App05'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Launcher />} />
        <Route path="/app-01" element={<App01 />} />
        <Route path="/app-02" element={<App02 />} />
        <Route path="/app-03" element={<App03 />} />
        <Route path="/app-04" element={<App04 />} />
        <Route path="/app-05" element={<App05 />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
