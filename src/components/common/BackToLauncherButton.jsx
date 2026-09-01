import { useNavigate } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import TouchButton from './TouchButton'

export default function BackToLauncherButton() {
  const navigate = useNavigate()

  return (
    <TouchButton
      variant="surface"
      icon={MdArrowBack}
      onClick={() => navigate('/')}
    >
      Back to launcher
    </TouchButton>
  )
}
