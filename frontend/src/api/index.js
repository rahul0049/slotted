import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const catalogAPI = {
  listProviders: (params) => api.get('/catalog/providers', { params }),
  getProvider: (id) => api.get(`/catalog/providers/${id}`),
  getInventory: (id) => api.get(`/catalog/providers/${id}/inventory`),
  listVenues: () => api.get('/catalog/venues'),
};

export const bookingAPI = {
  lockSeat: (unitId, providerId) =>
    api.post(`/booking/lock/${unitId}`, { providerId }),
  releaseLock: (unitId) =>
    api.delete(`/booking/lock/${unitId}`),
  createBooking: (data, idempotencyKey) =>
    api.post('/booking', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getBooking: (id) => api.get(`/booking/${id}`),
  getMyBookings: () => api.get('/booking'),
};


export const paymentAPI = {
  initiate: (bookingId) => api.post('/payment/initiate', { bookingId }),
};

export default api;
