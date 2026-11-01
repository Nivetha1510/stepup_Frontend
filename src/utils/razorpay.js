import { paymentService } from '../services'

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise

function loadScript() {
  if (window.Razorpay) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_URL
      s.onload = resolve
      s.onerror = () => { scriptPromise = undefined; reject(new Error('Could not load the payment window. Check your connection and try again.')) }
      document.body.appendChild(s)
    })
  }
  return scriptPromise
}

/**
 * Open Razorpay Checkout for an unpaid order. Card/UPI details are entered in Razorpay's own window and never
 * reach our code. Resolves { status: 'paid', order } once the server has verified the payment signature, or
 * { status: 'dismissed' } if the customer closes the window.
 */
export async function payForOrder(order) {
  const [info] = await Promise.all([paymentService.start(order.id), loadScript()])
  return new Promise((resolve, reject) => {
    let paid = false
    const checkout = new window.Razorpay({
      key: info.key,
      amount: info.amount,
      currency: info.currency,
      order_id: info.gateway_order_id,
      name: 'StepUp.in',
      description: `Order #${info.order_number}`,
      prefill: { name: info.name, email: info.email, contact: info.phone },
      theme: { color: '#2F4F4F' },
      handler: (response) => {
        paid = true
        paymentService.verify({ order_id: order.id, ...response })
          .then((verified) => resolve({ status: 'paid', order: verified }))
          .catch(reject)
      },
      modal: { ondismiss: () => { if (!paid) resolve({ status: 'dismissed' }) } },
    })
    checkout.open()
  })
}
