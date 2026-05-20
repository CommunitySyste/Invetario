<script setup>
import { onMounted } from 'vue'
import { setupLucide } from '../../assets/js/lucide'

onMounted(() => {
    setupLucide()
})

const emit = defineEmits(['close', 'descargar'])

const props = defineProps({
    pdfUrl: String
})

function imprimirPDF() {
    const iframe = document.querySelector('iframe');
    iframe?.contentWindow?.print();
}
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 880px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">PDF de Productos</h2>
                </div>
                <button @click="$emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-4">
                <div class="w-full h-[450px] border rounded-xl overflow-hidden">
                    <iframe v-if="pdfUrl" :src="pdfUrl" class="w-full h-full"></iframe>

                    <div v-else class="flex items-center justify-center h-full text-gray-500 text-sm">
                        No hay PDF generado
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button @click="$emit('descargar')"
                    class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 px-3 py-2 rounded text-white text-sm">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    Descargar
                </button>
                <button @click="imprimirPDF"
                    class="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 px-3 py-2 rounded text-white text-sm">
                    <i data-lucide="printer" class="w-4 h-4"></i>
                    Imprimir
                </button>
            </div>
        </div>
    </div>
</template>