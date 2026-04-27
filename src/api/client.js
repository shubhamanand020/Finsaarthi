import axios from 'axios';

const normalizeApiBaseUrl = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return null;

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (!hasProtocol) return null;

    return trimmed.replace(/\/+$/, '');
};

const resolvedBaseUrl =
    normalizeApiBaseUrl(import.meta.env.VITE_API_URL) ||
    'http://localhost:8080/api';

// Create an Axios instance using a normalized base URL
const apiClient = axios.create({
    baseURL: resolvedBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token to every outgoing request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Unpack ApiResponse and handle global errors
apiClient.interceptors.response.use(
    (response) => {
        // If the backend returned a successful ApiResponse object ({ success: true, message: ..., data: ... })
        if (response.data && typeof response.data === 'object' && response.data.hasOwnProperty('success')) {
            // Unwrap the actual data payload into response.data so components receive what they expect
            if (response.data.hasOwnProperty('data')) {
                response.data = response.data.data;
            }
        }
        return response;
    },
    (error) => {
        const requestUrl = error.config?.url || '';
        const currentPath = window.location.pathname;
        const hasStoredToken = Boolean(localStorage.getItem('token'));
        const isPublicAuthRequest = [
            '/auth/login',
            '/auth/register',
            '/auth/verify-registration-otp',
            '/auth/forgot-password',
            '/auth/verify-forgot-otp',
            '/auth/update-password',
            '/auth/captcha',
        ].some((path) => requestUrl.includes(path));
        const isPublicAuthPage = [
            '/login',
            '/register',
            '/forgot-password',
        ].some((path) => currentPath.startsWith(path));

        if (
            error.response?.status === 401 &&
            hasStoredToken &&
            !isPublicAuthRequest &&
            !isPublicAuthPage
        ) {
            const message = error.response?.data?.message || 'Your session has expired. Please log in again.';
            window.dispatchEvent(new CustomEvent('auth:logout', {
                detail: {
                    message,
                    showToast: true,
                },
            }));
            window.location.href = '/login/student';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
