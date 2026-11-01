import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import aboutKids from '../assets/images/about-kids-shoes.jpg'
import aboutSneakers from '../assets/images/about-sneakers.jpg'
import contactShoes from '../assets/images/contact-shoes.jpg'
import { EmptyState, Field } from '../components/Common'
import { useToast } from '../context/ToastContext'
import { errorMessage, fieldErrors } from '../services/api'
import { siteService } from '../services'

export function About() {
  return (
    <div className="about">
      <div className="about__intro">
        <div className="about__text">
          <h1 className="about__title">About StepUp</h1>
          <p>StepUp is India’s largest sports and athleisure footwear brand. Incorporated in 2006, StepUp Activewear is
            one of the leading players in organized sports &amp; casual footwear sector in India. Since 2016, the flagship
            brand "StepUp", has been the largest sports and athleisure footwear brand in India, in both volume and value
            terms. The company’s products are available via an expansive Pan-India network of over 15,000 geo-tagged
            multi-brand retail stores, 35+ company-owned exclusive outlets, large format stores such as Walmart, Vishal
            Retail and Reliance Smart among others and all the leading e-commerce portals.</p>
          <h2 className="about__title">Our Mission</h2>
          <p>At StepUp we craft shoes with care for everyone- men, women and kids, with an equal attention to detail,
            letting each shoe speak for itself. The world-class quality, trendy designs and affordable prices have
            captured the imagination of millions of people, across the country- making StepUp, an aspirational brand
            especially for - young adults, everyday performers and fashionistas.</p>
        </div>
        <div className="about__hero-circle"><img src={aboutSneakers} alt="Colourful StepUp sneakers" /></div>
      </div>
      <div className="about__center-circle"><img src={aboutKids} alt="Metallic kids' high-top shoes" /></div>
      <div className="about__values">
        <div><h3>Simplicity In Design</h3><p>No flashy logos,No senseless details, Just the world’s most comfortable
          shoes,made naturally and designed practically,It’s that simple.</p></div>
        <div><h3>Confidance in Comfort</h3><p>Trying is believing.Give our shoes a shot for 30 days.and if you’re not
          walking on cloud nine,we’ll take them back-no questions asked.</p></div>
        <div><h3>Made from Nature</h3><p>The footwear industry often overlooks mother Nature’s materials in favor of
          cheaper,synthetic alternatives.We think it’s time to change that.</p></div>
      </div>
    </div>
  )
}

export function Contact() {
  const location = useLocation()
  const toast = useToast()
  const initialMessage = location.state?.topic === 'password'
    ? 'Hi, I forgot my password. Please help me reset it. My account email is: ' : ''
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: initialMessage })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSending(true); setErrors({})
    try {
      const res = await siteService.contact(form)
      toast.show(res.detail)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setErrors(fieldErrors(err))
      toast.show(errorMessage(err), 'error')
    } finally { setSending(false) }
  }

  return (
    <div className="contact">
      <div className="contact__top">
        <div className="contact__info">
          <h1>Contact Us</h1>
          <h2>For Online Orders</h2>
          <p>Inquiry/Complanit</p>
          <p><a href="tel:9976357250">9976357250</a></p>
          <p className="contact__gap">Any other queries</p>
          <p><a href="tel:9976357250">9976357250</a></p>
          <p><a href="tel:9976357250">9976357250</a></p>
          <p>10 AM-7.00 PM</p>
          <p>Email: <a href="mailto:customercarestepup.in@gmail.com" className="underline">customercarestepup.in@gmail.com</a></p>
        </div>
        <div className="contact__img"><img src={contactShoes} alt="Colourful shoes" /></div>
      </div>
      <hr className="contact__rule" />
      <form className="enquiry" onSubmit={submit}>
        <h2>Enquiry Form</h2>
        <Field label="Name" error={errors.name}><input value={form.name} onChange={set('name')} required maxLength={120} /></Field>
        <div className="form-grid form-grid--wide-gap">
          <Field label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} required /></Field>
          <Field label="Phone" error={errors.phone}><input type="tel" value={form.phone} onChange={set('phone')} maxLength={15} /></Field>
        </div>
        <Field label="Message" error={errors.message}><textarea rows={6} value={form.message} onChange={set('message')} required maxLength={3000} /></Field>
        <button className="btn-send" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
      </form>
    </div>
  )
}

const INFO = {
  returns: ['Return & Exchange Policy', [
    'You can return or exchange unworn shoes in their original box within 7 days of delivery.',
    'Start a return from Contact Us with your order number. Refunds for prepaid orders go back to the original payment method within 5–7 business days; Cash on Delivery refunds are made by bank transfer.',
    'Sale items marked “Clearance” can be exchanged for size only.',
  ]],
  privacy: ['Privacy Policy', [
    'We collect only the information needed to process your orders: name, email, phone number and delivery address.',
    'Passwords are stored as secure one-way hashes. We never ask for or store your card number or CVV.',
    'We do not sell your personal information. You can ask us to delete your account at any time through Contact Us.',
  ]],
  terms: ['Terms of Service', [
    'By creating an account you agree to provide accurate information and to keep your password private.',
    'Prices and stock are confirmed when your order is placed. If an item becomes unavailable we will contact you and refund any payment.',
    'StepUp.in may update these terms; the latest version is always available on this page.',
  ]],
  shipping: ['Shipping Policy', [
    'Delivery is free on orders of ₹999 and above; a ₹99 delivery fee applies to smaller orders.',
    'Orders are dispatched within 24 hours and usually arrive in 5–7 business days.',
    'You can follow every order from Account → Orders → Track.',
  ]],
  blogs: ['Blogs', ['Style guides and shoe-care tips are coming soon. Follow us on social media for the latest updates.']],
}

export function InfoPage() {
  const { slug } = useParams()
  const page = INFO[slug]
  if (!page) return <NotFound />
  return (
    <article className="info-page">
      <h1 className="page-title">{page[0]}</h1>
      {page[1].map((p) => <p key={p}>{p}</p>)}
      <p><Link to="/contact" className="underline">Questions? Contact us</Link></p>
    </article>
  )
}

export function NotFound() {
  return <EmptyState title="Page not found" action="Back to home" to="/">The page you’re looking for doesn’t exist.</EmptyState>
}
