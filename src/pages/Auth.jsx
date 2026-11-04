import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Field, PasswordInput } from '../components/Common'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage, fieldErrors } from '../services/api'
import { GoogleLogin } from '@react-oauth/google'

export default function Auth({ mode = 'login' }) {
  const { login, register, googleLogin, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [form, setForm] = useState({ email: '', password: '', accept_terms: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated && !submitting) return <Navigate to={from} replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const switchTo = (m) => { setErrors({}); navigate(m === 'login' ? '/login' : '/register', { state: location.state, replace: true }) }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (mode === 'register') {
      const local = {}
      if (form.password.length < 8) local.password = 'Password must be at least 8 characters.'
      if (!form.accept_terms) local.accept_terms = 'Please accept the Terms and Conditions and Privacy Policy.'
      if (Object.keys(local).length) { setErrors(local); return }
    }
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.show('Welcome back!')
      } else {
        await register({ email: form.email, password: form.password, accept_terms: form.accept_terms })
        toast.show('Your account has been created')
      }
      navigate(from, { replace: true, state: location.state?.payment ? { payment: location.state.payment } : undefined })
    } catch (err) {
      setErrors({ ...fieldErrors(err), form: err.response?.data?.detail || (Object.keys(fieldErrors(err)).length ? '' : errorMessage(err)) })
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''}
            onClick={() => switchTo('login')}>Log in</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''}
            onClick={() => switchTo('register')}>Register</button>
        </div>

        <form className="auth__form" onSubmit={submit} noValidate>
          {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
          <Field label="Email id" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" autoComplete="email" required />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput value={form.password} onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </Field>

          {mode === 'login' ? (
            <>
              <Link to="/forgot-password" className="auth__forgot">Forget Password?</Link>
              <button type="submit" className="auth__submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Log In'}</button>
              <p className="auth__or">Or</p>
              <div className="auth__google">
  
<GoogleLogin
  onSuccess={async (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.show('Google credential not received.', 'error')
      return
    }

    setSubmitting(true)

    try {
      await googleLogin(credentialResponse.credential)

      toast.show('Successfully logged in with Google!')

      navigate(from, {
        replace: true,
        state: location.state?.payment
          ? { payment: location.state.payment }
          : undefined
      })
    } catch (err) {
      toast.show(errorMessage(err), 'error')
    } finally {
      setSubmitting(false)
    }
  }}
  onError={() => {
    toast.show('Google sign-in failed. Please try again.', 'error')
  }}
  theme="outline"
  size="large"
  shape="rectangular"
  text="signin_with"
  width="300"
/>

</div>
              <p className="auth__switch">Don’t have an account? <button type="button" onClick={() => switchTo('register')}>Register</button></p>
            </>
          ) : (
            <>
              <p className="auth__hint">At least 8 characters, not too common, and not only numbers.</p>
              <label className="checkbox auth__terms">
                <input type="checkbox" checked={form.accept_terms} onChange={set('accept_terms')} />
                <span>I have read and agreed to the <Link to="/info/terms">Terms and Conditions</Link> and <Link to="/info/privacy">Privacy Policy</Link></span>
              </label>
              {errors.accept_terms && <span className="field__error">{errors.accept_terms}</span>}
              <button type="submit" className="auth__submit" disabled={submitting}>{submitting ? 'Creating…' : 'Register'}</button>
              <p className="auth__switch">Already have an account? <button type="button" onClick={() => switchTo('login')}>Log in</button></p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
