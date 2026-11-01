import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field } from '../components/Common'
import { authService } from '../services'
import { errorMessage } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return // ignore double clicks / repeated Enter presses
    setError('')

    const value = email.trim()
    if (!value) return setEmailError('Please enter your email address.')
    if (!/^\S+@\S+\.\S+$/.test(value)) return setEmailError('Enter a valid email address.')
    setEmailError('')

    setLoading(true)
    try {
      const result = await authService.forgotPassword(value)
      setMessage(result.detail)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (message) {
    return (
      <div className="auth">
        <div className="auth__card auth__card--compact">
          <div className="auth__panel">
            <h2>Check Your Email</h2>
            <p className="auth__status" role="status">{message}</p>
            <p>The link expires in 1 hour. If you don’t see the email, check your spam folder
              or try again in a minute.</p>
            <Link to="/login" className="auth__submit auth__submit--link">Back to Login</Link>
            <button type="button" className="auth__link auth__link--button"
              onClick={() => { setMessage(''); setEmail('') }}>Use a different email</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card auth__card--compact">
        <div className="auth__panel">
          <h2>Forgot Password?</h2>
          <p>Enter your registered email to receive a password reset link.</p>

          <form className="auth__stack" onSubmit={handleSubmit} noValidate>
            <Field label="Email Address" error={emailError}>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                placeholder="Enter your email"
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
              />
            </Field>

            {error && <p className="auth__alert" role="alert">{error}</p>}

            <button
              type="submit"
              className="auth__submit"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <Link to="/login" className="auth__link">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
