import ScreenLayout from '../components/layout/ScreenLayout'
import ScreenHeader from '../components/layout/ScreenHeader'
import BackToLauncherButton from '../components/common/BackToLauncherButton'

export default function NotFound() {
  return (
    <ScreenLayout
      header={
        <ScreenHeader
          title="Screen not found"
          actions={<BackToLauncherButton />}
        />
      }
    >
      <p className="text-xl text-muted">
        This route does not exist in the application.
      </p>
    </ScreenLayout>
  )
}
