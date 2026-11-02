import api from './api'

const data = (p) => p.then((r) => r.data)

export const productService = {
  list: (params) => data(api.get('/products/', { params })),
  detail: (idOrSlug) => data(api.get(`/products/${idOrSlug}/`)),
  filters: (category) => data(api.get('/products/filters/', { params: category && category !== 'all' ? { category } : {} })),
  reviews: (id) => data(api.get(`/products/${id}/reviews/`)),
  addReview: (id, payload) => data(api.post(`/products/${id}/reviews/`, payload)),
  categories: () => data(api.get('/categories/')),
  menu: () => data(api.get('/menu/')),
  banners: () => data(api.get('/banners/')),
}


export const authService = {
  login: (email, password) =>
    data(api.post('/auth/login/', { email, password })),

  register: (payload) =>
    data(api.post('/auth/register/', payload)),

  googleLogin: (credential) =>
    data(api.post('/auth/google/', { credential })),

  logout: () =>
    data(api.post('/auth/logout/')),

  me: () =>
    data(api.get('/auth/me/')),

  updateMe: (payload) =>
    data(api.patch('/auth/me/', payload)),

  changePassword: (payload) =>
    data(api.post('/auth/change-password/', payload)),
  forgotPassword: (email) =>
  data(api.post('/auth/forgot-password/', { email })),

  resetPassword: (payload) =>
  data(api.post('/auth/reset-password/', payload)),
}


export const cartService = {
  get: () => data(api.get('/cart/')),
  add: (variant, quantity = 1) => data(api.post('/cart/items/', { variant, quantity })),
  update: (id, payload) => data(api.patch(`/cart/items/${id}/`, payload)),
  remove: (id) => data(api.delete(`/cart/items/${id}/`)),
}

export const orderService = {
  list: (page = 1) => data(api.get('/orders/', { params: { page } })),
  detail: (id) => data(api.get(`/orders/${id}/`)),
  create: (payload, idempotencyKey) =>
    data(api.post('/orders/', payload, { headers: { 'X-Idempotency-Key': idempotencyKey } })),
  cancel: (id) => data(api.post(`/orders/${id}/cancel/`)),
}

export const paymentService = {
  config: () => data(api.get('/payments/config/')),
  start: (orderId) => data(api.post('/payments/start/', { order_id: orderId })),
  verify: (payload) => data(api.post('/payments/verify/', payload)),
  upiDetails: (orderId) => data(api.get(`/payments/upi/${orderId}/`)),
  upiReference: (orderId, reference) => data(api.post('/payments/upi/reference/', { order_id: orderId, reference })),
}

export const wishlistService = {
  list: () => data(api.get('/wishlist/')),
  add: (productId) => data(api.post('/wishlist/', { product_id: productId })),
  remove: (productId) => api.delete(`/wishlist/${productId}/`),
}

export const addressService = {
  list: () => data(api.get('/addresses/')),
  create: (payload) => data(api.post('/addresses/', payload)),
  update: (id, payload) => data(api.patch(`/addresses/${id}/`, payload)),
  remove: (id) => api.delete(`/addresses/${id}/`),
}

export const siteService = {
  contact: (payload) => data(api.post('/contact/', payload)),
  subscribe: (email) => data(api.post('/newsletter/', { email })),
}
