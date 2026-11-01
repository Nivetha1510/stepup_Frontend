import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from './Icons'

/** Password input with a show/hide toggle (login, register, reset password). */
export function PasswordInput({ value, onChange, autoComplete, placeholder = 'Enter password', required = true, ...rest }) {
  const [show, setShow] = useState(false)
  return (
    <span className="password-input">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} required={required} {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <Eye /> : <EyeOff />}
      </button>
    </span>
  )
}

export function Stars({ value = 0, size = 20, color }) {
  const full = Math.round(Number(value))
  return (
    <span className="stars" style={{ fontSize: size, '--star': color }} aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= full ? 'stars__on' : 'stars__off'} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <p>{message}</p>
      {onRetry && <button className="btn btn--primary" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function EmptyState({ title, children, action, to }) {
  return (
    <div className="state-box">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <Link className="btn btn--primary" to={to}>{action}</Link>}
    </div>
  )
}

export function Swatch({ color, selected, onClick, size = 'sm' }) {
  const white = (color.hex_code || '').toUpperCase() === '#FFFFFF'
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} title={color.name} aria-label={color.name}
      aria-pressed={onClick ? Boolean(selected) : undefined}
      className={`swatch swatch--${size}${white ? ' swatch--white' : ''}${selected ? ' is-selected' : ''}`}
      style={{ background: color.hex_code || undefined }} />
  )
}

export function ColorRow({ colors, selectedId, onSelect, size }) {
  if (!colors?.length) return null
  const multi = colors.length === 1 && !colors[0].hex_code
  if (multi) return <span className="color-row__multi">Multi-color</span>
  return (
    <span className="color-row__swatches">
      {colors.map((c) => (
        <Swatch key={c.id} color={c} size={size} selected={selectedId === c.id}
          onClick={onSelect ? () => onSelect(c.id) : undefined} />
      ))}
    </span>
  )
}

export function Field({ label, error, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}
