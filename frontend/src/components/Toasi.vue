<script setup>
import {nextTick, onMounted, watch } from 'vue'
import { useNotificationStore } from '../stores/toastNotify'
import '../assets/css/toast.css'
import { setupLucide } from '../assets/js/lucide'
const notif = useNotificationStore()

onMounted(() => {
    setupLucide()
})

watch(
    () => notif.show,
    async (value) => {
        if (value) {
            await nextTick()
            setupLucide()
        }
    }
)
</script>
<template>
    <transition name="fade">
        <div v-if="notif.show" class="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
            :class="{
                'bg-green-500 text-white': notif.type === 'success',
                'bg-red-500 text-white': notif.type === 'error',
                'bg-blue-500 text-white': notif.type === 'info',
                'bg-yellow-500 text-white': notif.type === 'warning'
            }">
            <i v-if="notif.type === 'success'" data-lucide="check-circle"></i>
            <i v-if="notif.type === 'error'" data-lucide="x-circle"></i>
            <i v-if="notif.type === 'warning'" data-lucide="alert-triangle"></i>
            
            <span>{{ notif.message }}</span>
        </div>
    </transition>
</template>