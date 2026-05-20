<script setup>
const props = defineProps({
    message: String
})

const emit = defineEmits(['confirm', 'cancel'])
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 w-full" style="max-width: 380px;">
            <h2 class="text-base font-semibold mb-2">Confirmar acción</h2>
            <p class="text-sm mb-4">{{ message }}</p>
            <div class="flex justify-end gap-3">
                <button @click="emit('cancel')" class="btn-cancel px-4 py-2 rounded-xl text-sm border">
                    Cancelar
                </button>
                <button @click="emit('confirm')"
                    class="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition">
                    Eliminar
                </button>
            </div>

        </div>
    </div>
</template>