<script setup>
import '../assets/css/login.css';
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useNotificationStore } from '../stores/toastNotify'
import { setupLucide } from '../assets/js/lucide'

const router = useRouter();
const auth = useAuthStore();
const notif = useNotificationStore();
const loading = ref(false);
const error = ref('');
const showPass = ref(false);

const form = reactive({
    username: '',
    password: '',
});

onMounted(() => setupLucide())
function togglePassword() {
    showPass.value = !showPass.value;
}

async function handleLogin() {
    if (!form.username || !form.password) {
        notif.notify('Por favor, rellena todos los campos', 'warning');
        return;
    }
    try {
        loading.value = true;
        error.value = '';
        await auth.login({ username: form.username, password: form.password });
        notif.notify(`Bienvenido ${form.username} al sistema de invetario`, 'success');
        setTimeout(() => {
            router.push('/index');
        }, 1200);
        nextTick(() => setupLucide())

    } catch (error) {
        notif.notify('Usuario o contraseña incorrectos', 'error');
        nextTick(() => setupLucide())
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <div class="login-root min-h-screen flex">
        <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden brand-panel">
            <div class="geo-bg" aria-hidden="true">
                <div class="geo-circle geo-1"></div>
                <div class="geo-circle geo-2"></div>
                <div class="geo-circle geo-3"></div>
                <div class="geo-lines"></div>
            </div>
            <div class="relative z-10 flex items-center gap-3">
                <div class="brand-icon">
                    <i data-lucide="shopping-bag"></i>
                </div>
                <span class="brand-name">Velour</span>
            </div>

            <div class="relative z-10 space-y-6">
                <p class="brand-tag">Sistema de Inventario</p>
                <h2 class="brand-headline">
                    Gestiona tu<br />
                    <em>colección</em><br />
                    con precisión.
                </h2>
                <p class="brand-sub">
                    Ropa, calzado y accesorios — todo en un solo lugar.<br />
                    Control total de stock para tu negocio.
                </p>

                <div class="stats-row">
                    <div class="stat-pill">
                        <span class="stat-num">+2.4k</span>
                        <span class="stat-label">Productos</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">98%</span>
                        <span class="stat-label">Precisión</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">24/7</span>
                        <span class="stat-label">Acceso</span>
                    </div>
                </div>
            </div>

            <div class="relative z-10 flex flex-wrap gap-2">
                <span class="cat-tag">👗 Damas</span>
                <span class="cat-tag">👔 Caballeros</span>
                <span class="cat-tag">👟 Calzado</span>
                <span class="cat-tag">⌚ Relojes</span>
                <span class="cat-tag">📿 Accesorios</span>
            </div>
        </div>

        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 form-panel">
            <div class="w-full max-w-md space-y-8">
                <div class="lg:hidden flex items-center gap-2 mb-4">
                    <div class="brand-icon brand-icon--sm">
                        <i data-lucide="shopping-bag"></i>
                    </div>
                    <span class="brand-name brand-name--dark">Velour</span>
                </div>

                <div>
                    <h1 class="form-title">Bienvenido</h1>
                    <p class="form-subtitle">Ingresa tus credenciales para continuar</p>
                </div>

                <div class="space-y-5">
                    <div class="field-group">
                        <label class="field-label">Usuario</label>
                        <div class="field-wrap">
                            <span class="field-icon">
                                <i data-lucide="user"></i>
                            </span>
                            <input v-model="form.username" type="text" class="field-input"
                                placeholder="nombre de usuario" autocomplete="username" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label class="field-label">Contraseña</label>
                        <div class="field-wrap">
                            <span class="field-icon">
                                <i data-lucide="lock"></i>
                            </span>
                            <input v-model="form.password" type="password" class="field-input" placeholder="••••••••"
                                autocomplete="current-password" />
                            <button type="button" class="field-eye" tabindex="-1">
                                <i data-lucide="eye"></i>
                            </button>
                        </div>
                    </div>

                    <button @click="handleLogin" type="button" class="btn-login" :disabled="loading">
                        <template v-if="!loading">
                            <span>Ingresar al sistema</span>
                            <i data-lucide="arrow-right"></i>
                        </template>

                        <template v-else>
                            <span>Verificando...</span>
                        </template>
                    </button>
                </div>
                <!-- Footer -->
                <p class="form-footer">
                    Sistema de Inventario Velour &copy; 2025
                </p>
            </div>
        </div>

    </div>
</template>