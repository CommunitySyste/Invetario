<script setup>
import { onMounted } from 'vue'
import { setupLucide } from '../../assets/js/lucide'

onMounted(() => {
    setupLucide()
})

const emit = defineEmits(['close', 'descargar'])

</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 900px;">
 
            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">Vista previa del reporte</h2>
                    <p class="text-xs modal-sub">Revisa los datos antes de descargar</p>
                </div>
                <button @click="$emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>
 
            <div class="modal-divider"></div>
 
            <!-- Contenido slot -->
            <div class="w-full overflow-auto" style="max-height: 500px;">
                <slot name="preview">
                    <div class="flex items-center justify-center h-40 text-sm" style="color:#55526a;">
                        No hay datos para mostrar
                    </div>
                </slot>
            </div>
 
            <div class="modal-divider"></div>
 
            <!-- Botones -->
            <div class="flex items-center justify-end gap-2">
                <button @click="$emit('close')"
                    class="btn-cancel flex items-center gap-2 px-4 py-2 rounded-xl text-sm border">
                    <i data-lucide="x" class="w-4 h-4"></i>
                    Cancelar
                </button>
                <button @click="$emit('descargar')"
                    class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    Descargar Excel
                </button>
            </div>
 
        </div>
    </div>
</template>
