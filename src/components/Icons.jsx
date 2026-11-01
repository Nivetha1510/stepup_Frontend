/* Small inline SVG icon set (no external icon library needed). */
const base = (size) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true })

export const SearchIcon = ({ size = 22 }) => (
  <svg {...base(size)} strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const CartIcon = ({ size = 22 }) => (
  <svg {...base(size)}><path d="M3 4h2.5l2.2 10.5a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <path d="M8 11h11" /><circle cx="9.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /></svg>
)
export const ArrowLeft = ({ size = 18 }) => (
  <svg {...base(size)} strokeWidth="2.6"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
)
export const ArrowRight = ({ size = 18 }) => (
  <svg {...base(size)} strokeWidth="2.6"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
)
export const ChevronLeft = ({ size = 22 }) => (<svg {...base(size)} strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>)
export const CaretDown = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16l-8 10z" fill="currentColor" /></svg>
)
export const EyeOff = ({ size = 20 }) => (
  <svg {...base(size)}><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9" />
    <path d="M6.6 6.6C3.9 8.4 2 12 2 12s4 7 10 7a9.8 9.8 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
)
export const Eye = ({ size = 20 }) => (
  <svg {...base(size)}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const TrashIcon = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M4 6h16" /><path d="M9 6V4h6v2" /><rect x="6" y="6" width="12" height="14" rx="1" />
    <path d="M10 10v6M14 10v6" /></svg>
)
export const LockIcon = ({ size = 20 }) => (
  <svg {...base(size)}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
)
export const TruckIcon = ({ size = 22 }) => (
  <svg {...base(size)}><path d="M2 6h11v10H2z" /><path d="M13 9h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" /></svg>
)
export const HeartIcon = ({ size = 22, filled = false }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.3 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.7 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21z" /></svg>
)
export const CheckIcon = ({ size = 20 }) => (<svg {...base(size)} strokeWidth="3"><path d="m5 12 5 5 9-10" /></svg>)
export const ThumbIcon = ({ size = 28 }) => (
  <svg {...base(size)}><path d="M7 11v9H4v-9z" /><path d="M7 11l4-7a2 2 0 0 1 3 2l-1 4h5.5a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.2 20H7" /></svg>
)
export const MenuIcon = ({ size = 26 }) => (<svg {...base(size)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>)
export const CloseIcon = ({ size = 22 }) => (<svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const UserIcon = ({ size = 20 }) => (
  <svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
)
export const GoogleG = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)
export const WhatsAppIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#25D366" />
    <path fill="#fff" d="M16.6 13.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.2 6.2 0 0 1-3.1-2.7c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.3 11.3 0 0 0 4.3 3.8c1.6.7 2.3.7 3.1.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.2-.4-.3z" /></svg>
)
export const SocialIcons = () => (
  <div className="social-icons">
    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
      <svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#3B5998" /><path fill="#fff" d="M13.5 20v-6.5h2.2l.3-2.6h-2.5V9.3c0-.7.2-1.3 1.3-1.3H16V5.7a18 18 0 0 0-2-.1c-2 0-3.3 1.2-3.3 3.4v1.9H8.5v2.6h2.2V20z" /></svg>
    </a>
    <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
      <svg width="20" height="20" viewBox="0 0 24 24"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75" /><stop offset=".5" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" /></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig)" /><rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="16.3" cy="7.7" r="1" fill="#fff" /></svg>
    </a>
    <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
      <svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1DA1F2" /><path fill="#fff" d="M18.5 8.3c-.5.2-1 .4-1.5.4.5-.3 1-.8 1.2-1.4-.5.3-1.1.5-1.7.6a2.6 2.6 0 0 0-4.5 2.4 7.5 7.5 0 0 1-5.4-2.8 2.6 2.6 0 0 0 .8 3.5c-.4 0-.8-.1-1.2-.3 0 1.3.9 2.3 2.1 2.6-.4.1-.8.1-1.2 0 .3 1 1.3 1.8 2.5 1.8a5.3 5.3 0 0 1-3.9 1.1A7.5 7.5 0 0 0 17 9.9v-.3c.6-.4 1.1-.8 1.5-1.3z" /></svg>
    </a>
    <a href="https://meta.com" target="_blank" rel="noreferrer" aria-label="Meta">
      <svg width="30" height="20" viewBox="0 0 36 20"><path fill="none" stroke="#0668E1" strokeWidth="3.2" strokeLinecap="round" d="M4 15c0-6 3-11 6.5-11S16 9 18 11.5 22 18 25.5 18 32 15 32 10 29 4 25.5 4 20 8 18 10.5 14 16 10.5 16 4 15 4 15z" /></svg>
    </a>
  </div>
)
