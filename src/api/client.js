import axios from 'axios';

const normalizeApiBaseUrl = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return null;

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (!hasProtocol) return null;

    return trimmed.replace(/\/+$/, '');
};

const rawApiBaseUrl = String(import.meta.env.VITE_API_URL || '').trim();
const normalizedApiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl);
const isDevelopment = import.meta.env.DEV;
const resolvedBaseUrl = normalizedApiBaseUrl || (isDevelopment ? 'http://localhost:8080/api' : null);

const getApiConfigurationError = () => {
    const exampleUrl = 'https://finsaarthibackend-production.up.railway.app/api';

    if (!rawApiBaseUrl) {
        return `Missing VITE_API_URL. Set it to a full backend URL like ${exampleUrl}.`;
    }

    return `Invalid VITE_API_URL "${rawApiBaseUrl}". Use a full backend URL like ${exampleUrl}.`;
};

const createApiConfigurationError = () => {
    const error = new Error(getApiConfigurationError());
    error.code = 'API_BASE_URL_MISCONFIGURED';
    return error;
};

const isHtmlDocumentResponse = (response) => {
    const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
    return contentType.includes('text/html');
};

// Create an Axios instance using a normalized base URL
const apiClient = axios.create({
    ...(resolvedBaseUrl ? { baseURL: resolvedBaseUrl } : {}),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token to every outgoing request
apiClient.interceptors.request.use(
    (config) => {
        if (!resolvedBaseUrl) {
            return Promise.reject(createApiConfigurationError());
        }

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
        if (isHtmlDocumentResponse(response)) {
            return Promise.reject(
                new Error(
                    `Received HTML from ${response.config?.url || 'the API request'} instead of JSON. Check VITE_API_URL and Vercel rewrites.`
                )
            );
        }

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
