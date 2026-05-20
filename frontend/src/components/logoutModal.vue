<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useNotificationStore } from '../stores/toastNotify'
import { setupLucide } from '../assets/js/lucide'

const notif = useNotificationStore()

defineProps({
    visible: Boolean
})

const emit = defineEmits(['confirm', 'cancel'])

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
        <div v-if="visible"
            class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div class="bg-[#1b1b29] border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">

                <!-- Icon -->
                <div class="flex items-center justify-center mb-4">
                    <div class="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                        <i data-lucide="log-out" class="w-8 h-8 text-red-400"></i>
                    </div>
                </div>

                <!-- Texto -->
                <div class="text-center mb-6">
                    <h2 class="text-xl font-semibold text-white mb-2">
                        Cerrar sesión
                    </h2>

                    <p class="text-sm text-slate-400">
                        ¿Seguro que deseas salir del sistema?
                    </p>
                </div>

                <!-- Botones -->
                <div class="flex items-center justify-center gap-3">
                    <button
                        @click="emit('cancel')"
                        class="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition">
                        Cancelar
                    </button>

                    <button
                        @click="emit('confirm')"
                        class="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition flex items-center gap-2">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                        Sí, salir
                    </button>
                </div>

            </div>
        </div>
    </transition>
</template>