import axios from 'axios';

// Each backend microservice runs on its own port in local dev.
// In production you'd typically put these behind a single API gateway.
export const AUTH_BASE = 'http://localhost:8081';
export const PRODUCT_BASE = 'http://localhost:8082';
export const ORDER_BASE = 'http://localhost:8083';

function createClient(baseURL) {
  const client = axios.create({ baseURL });

  // Attach the JWT (if present) to every outgoing request
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // If the token is rejected/expired, force a re-login
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const authApi = createClient(AUTH_BASE);
export const productApi = createClient(PRODUCT_BASE);
export const orderApi = createClient(ORDER_BASE);
