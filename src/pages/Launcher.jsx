import { APP_TITLE, APP_SUBTITLE, APP_LOGO } from '../config/app'
import ScreenLayout from '../components/layout/ScreenLayout'
import ScreenHeader from '../components/layout/ScreenHeader'
import ExperienceGrid from '../components/launcher/ExperienceGrid'

export default function Launcher() {
  return (
    <ScreenLayout
      ambient
      header={
        <ScreenHeader
          title={APP_TITLE}
          subtitle={APP_SUBTITLE}
          logo={APP_LOGO}
        />
      }
    >
      <ExperienceGrid />
    </ScreenLayout>
  )
}
