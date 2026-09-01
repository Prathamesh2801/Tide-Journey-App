import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import CacheStatus from './components/common/CacheStatus'

/**
 * HashRouter is used deliberately: the app is served from a local XAMPP
 * document root with no server-side rewrite rules, so deep links must
 * not hit the server as real paths.
 */
export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
      <CacheStatus />
    </HashRouter>
  )
}
