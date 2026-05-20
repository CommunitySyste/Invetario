import { config } from '@vue/test-utils';
import axios from 'axios';
import { useAuthStore } from '../stores/auth'
import router from '../router';

const api = axios.create({
    baseURL: 'https://inventario-api-253x.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const auth = useAuthStore();

    if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config
})

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response.status === 401) {
            const auth = useAuthStore();

            auth.logout();
            router.push('/');
        }
        return Promise.reject(err);
    }
)
export default api;