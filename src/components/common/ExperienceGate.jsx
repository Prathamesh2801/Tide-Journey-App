import { useNavigate } from 'react-router-dom'
import { getExperienceById } from '../../config/experiences'
import { useExperienceLock } from '../../hooks/useExperienceLock'
import PasscodeScreen from './PasscodeScreen'

/**
 * Wraps an experience so it only renders once its passcode is entered.
 *
 * Children are given as a function rather than elements so a locked
 * experience never mounts at all - important here because the experiences
 * start video and audio playback on mount.
 */
export default function ExperienceGate({ experienceId, children }) {
  const navigate = useNavigate()
  const experience = getExperienceById(experienceId)
  const { unlocked, passcode, unlock, verify } = useExperienceLock(experienceId)

  if (!unlocked) {
    return (
      <PasscodeScreen
        experience={experience}
        passcode={passcode}
        onVerify={verify}
        onUnlock={unlock}
        onCancel={() => navigate('/')}
      />
    )
  }

  return children()
}
