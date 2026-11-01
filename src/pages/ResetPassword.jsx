import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Field, PasswordInput } from '../components/Common'
import { authService } from '../services'
import { errorMessage, fieldErrors } from '../services/api'

const MIN_LENGTH = 8

function validate(password, confirmPassword) {
  const e = {}
  if (!password) e.password = 'Please enter a new password.'
  else if (password.length < MIN_LENGTH) e.password = `Password must be at least ${MIN_LENGTH} characters.`
  if (!confirmPassword) e.confirm = 'Please confirm your new password.'
  else if (password && confirmPassword !== password) e.confirm = 'Passwords do not match.'
  return e
}

function LinkProblem({ title = 'This reset link is invalid or has expired' }) {
  return (
    <div className="auth">
      <div className="auth__card auth__card--compact">
        <div className="auth__panel">
          <h2>{title}</h2>
          <p>For your security, reset links expire after a short time and can only be used once.
            Please request a new link to continue.</p>
          <Link to="/forgot-password" className="auth__submit auth__submit--link">Request a new link</Link>
          <Link to="/login" className="auth__link">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [linkRejected, setLinkRejected] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return // ignore double clicks / repeated Enter presses
    setError('')

    const found = validate(password, confirmPassword)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    try {
      const result = await authService.resetPassword({
        uid,
        token,
        password,
        confirm_password: confirmPassword
      })

      setMessage(result.detail)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      const status = err.response?.status
      const fields = fieldErrors(err)
      if (status === 400 && /invalid or expired/i.test(err.response?.data?.detail || '')) {
        setLinkRejected(true)
      } else if (fields.password) {
        setErrors({ password: fields.password })
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token || linkRejected) return <LinkProblem />

  return (
    <div className="auth">
      <div className="auth__card auth__card--compact">
        <div className="auth__panel">
          <h2>{message ? 'Password Updated' : 'Reset Password'}</h2>

          {message ? (
            <>
              <p className="auth__status" role="status">{message}</p>
              <Link to="/login" className="auth__submit auth__submit--link">Go to Login</Link>
            </>
          ) : (
            <form className="auth__stack" onSubmit={handleSubmit} noValidate>
              <Field label="New Password" error={errors.password}>
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })) }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                />
              </Field>
              {!errors.password && (
                <p className="auth__hint">At least {MIN_LENGTH} characters, not too common, and not only numbers.</p>
              )}

              <Field label="Confirm New Password" error={errors.confirm}>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })) }}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                />
              </Field>

              {error && <p className="auth__alert" role="alert">{error}</p>}

              <button
                type="submit"
                className="auth__submit"
                disabled={loading}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <Link to="/login" className="auth__link">Back to Login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
