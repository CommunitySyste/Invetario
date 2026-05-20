import { defineStore } from 'pinia'
import {ref, computed} from 'vue'
import api from '../api/axios'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const menus = ref(JSON.parse(localStorage.getItem('menus')) || []);
    const permisos = ref(JSON.parse(localStorage.getItem('permisos')) || []);

    const isAuthenticated = computed(() => !!token.value);

    async function login(data) {
        const { data: res } = await api.post('/login', data);
        token.value = res.token;
        user.value = res.user;
        menus.value = res.menus;
        permisos.value = res.permisos;

        localStorage.setItem('token', token.value);
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('menus', JSON.stringify(menus.value));
        localStorage.setItem('permisos', JSON.stringify(permisos.value));
    }

    function logout() {
        token.value = null;
        user.value = null;
        menus.value = [];
        permisos.value = [];

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('menus');
        localStorage.removeItem('permisos');

    }

    return { token, user, menus, isAuthenticated, login, logout, permisos };
})