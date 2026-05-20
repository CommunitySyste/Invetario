<script setup>
import '../assets/css/dasboard.css'
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Toast from '../components/Toasi.vue'
import LogoutModal from '../components/logoutModal.vue'
import { useNotificationStore } from '../stores/toastNotify'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(false)
const collapsed = ref(false)
const logoutVisible = ref(false)
const notif = useNotificationStore()

const currentPageTitle = computed(() => {
    for (const menu of auth.menus) {
        for (const sub of menu.subMenus) {
            if ('/' + sub.ruta === route.path) return sub.nombre
        }
    }
    return 'Dashboard'
})

function handleLogout() {
    logoutVisible.value = true
}

function confirmLogout() {
    auth.logout()
    notif.notify('Sesión cerrada exitosamente', 'success')
    logoutVisible.value = false
    setTimeout(() => {
        router.push('/')
    }, 1200)
}
function toggleSidebar() {
    // En desktop: colapsar/expandir
    if (window.innerWidth >= 1024) {
        collapsed.value = !collapsed.value
    } else {
        // En móvil/tablet: abrir overlay
        sidebarOpen.value = true
    }
}
</script>
<template>
    <div class="layout-root">
        <div v-if="sidebarOpen" class="sidebar-overlay lg:hidden" @click="sidebarOpen = false"></div>
        <aside :class="['sidebar', { 'sidebar--open': sidebarOpen, 'sidebar--collapsed': collapsed }]">
            <!-- Brand -->
            <div class="sidebar-brand">
                <div class="brand-icon">
                    <i data-lucide="shopping-bag"></i>
                </div>
                <span class="brand-name" v-show="!collapsed">Velour</span>
            </div>

            <!-- User card -->
            <div class="user-card" :class="{ 'user-card--collapsed': collapsed }">
                <div class="user-avatar" :style="{
                    background: (auth.user?.color || '#7c5cbf') + '22',
                    borderColor: auth.user?.color || '#7c5cbf'
                }">
                    <span>{{ auth.user?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="user-info" v-show="!collapsed">
                    <p class="user-name">{{ auth.user?.username }}</p>
                    <span class="user-role" :style="{ color: auth.user?.color || '#9b7ad4' }">
                        {{ auth.user?.rolusuario }}
                    </span>
                </div>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Navegación dinámica -->
            <nav class="sidebar-nav">
                <div v-for="menu in auth.menus" :key="menu.id" class="nav-group">
                    <!-- Label del grupo solo cuando no está colapsado -->
                    <p class="nav-group-label" v-show="!collapsed">{{ menu.nombre }}</p>
                    <!-- Divisor cuando está colapsado -->
                    <div class="nav-group-divider" v-show="collapsed"></div>

                    <router-link v-for="sub in menu.subMenus" :key="sub.id" :to="'/' + sub.ruta" class="nav-item"
                        :class="{ 'nav-item--icon-only': collapsed }" active-class="nav-item--active"
                        :title="collapsed ? sub.nombre : ''">
                        <span class="nav-icon"><i :data-lucide="sub.icono"></i></span>
                        <span class="nav-label" v-show="!collapsed">{{ sub.nombre }}</span>
                    </router-link>
                </div>
            </nav>

            <!-- Logout -->
            <div class="sidebar-footer">
                <div class="sidebar-divider"></div>
                <button class="nav-item nav-item--logout" :class="{ 'nav-item--icon-only': collapsed }"
                    style="width:100%" @click="handleLogout" :title="collapsed ? 'Cerrar sesión' : ''">
                    <span class="nav-icon"><i data-lucide="log-out"></i></span>
                    <span class="nav-label" v-show="!collapsed">Cerrar sesión</span>
                </button>
            </div>

        </aside>

        <!-- ── CONTENIDO ── -->
        <div class="layout-content" :class="{ 'layout-content--collapsed': collapsed }">

            <!-- Topbar -->
            <header class="topbar">
                <!-- Hamburger móvil -->
                <button class="topbar-menu" @click="toggleSidebar">
                    <i data-lucide="menu"></i>
                </button>
                <div class="topbar-title">
                    <h1>{{ currentPageTitle }}</h1>
                </div>

                <div class="topbar-actions">
                    <button class="topbar-btn">
                        <i data-lucide="bell"></i>
                        <span class="notif-dot"></span>
                    </button>
                    <div class="topbar-avatar" :style="{
                        background: (auth.user?.color || '#7c5cbf') + '22',
                        borderColor: auth.user?.color || '#7c5cbf'
                    }">
                        <span>{{ auth.user?.username?.charAt(0).toUpperCase() }}</span>
                    </div>
                </div>
            </header>

            <!-- Vista dinámica -->
            <main class="layout-main">
                <RouterView />
                <Toast />
                <LogoutModal :visible="logoutVisible" @confirm="confirmLogout" @cancel="logoutVisible = false" />
            </main>

        </div>
    </div>
</template>