import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../services/api'
import { siteService } from '../services'
import { SocialIcons } from './Icons'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const subscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    try {
      const res = await siteService.subscribe(email.trim())
      toast.show(res.detail)
      setEmail('')
    } catch (err) {
      toast.show(errorMessage(err, 'Please enter a valid email address.'), 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col site-footer__contact">
          <h3>Contact Us</h3>
          <p>We’d love to hear from you!<br />
            Landline : XXXXXXXXXXX<br />
            WhatsApp : +91XXXXXXXXXX<br />
            Email : <a href="mailto:stepup@gmail.com">stepup@gmail.com</a><br />
            Address :2/38, yyyyyyyyyyy<br />
            Tenkasi,Tamilnadu ,India.</p>
        </div>
        <div className="site-footer__col">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop/all?sort=new">New in</Link></li>
            <li><Link to="/shop/womens">Women</Link></li>
            <li><Link to="/shop/mens">Men</Link></li>
            <li><Link to="/shop/kids">Accessories</Link></li>
            <li><Link to="/shop/womens?style=heels">Heels</Link></li>
            <li><Link to="/about">About us</Link></li>
          </ul>
        </div>
        <div className="site-footer__col">
          <h3>Info</h3>
          <ul>
            <li><Link to="/shop/all">Search</Link></li>
            <li><Link to="/info/returns">Return &amp; Exchange Policy</Link></li>
            <li><Link to="/info/privacy">Privacy Policy</Link></li>
            <li><Link to="/info/terms">Terms of Service</Link></li>
            <li><Link to="/info/shipping">Shipping Policy</Link></li>
            <li><Link to="/info/blogs">Blogs</Link></li>
          </ul>
        </div>
        <div className="site-footer__col">
          <h3 className="site-footer__social-title">Social Media</h3>
          <SocialIcons />
        </div>
        <div className="site-footer__col site-footer__newsletter">
          <h3>Lets stay in touch !</h3>
          <p className="site-footer__lead">Sign up for exclusive offers, original stories, events and more.</p>
          <form onSubmit={subscribe}>
            <label htmlFor="newsletter-email">Email id</label>
            <input id="newsletter-email" type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Subscribe'}</button>
          </form>
        </div>
      </div>
      <p className="site-footer__copy">© {new Date().getFullYear()} StepUp.in — All rights reserved.</p>
    </footer>
  )
}
