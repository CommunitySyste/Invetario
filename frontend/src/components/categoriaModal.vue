<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'

const props = defineProps({
    categoria: Object
})
const emit = defineEmits(['close', 'save', 'update'])
const notif = useNotificationStore()
const nombre = ref('')
const descripcion = ref('')
const color = ref('')
const icono = ref('')
const COLORS = ['#FF2C2C', '#b899f5', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#a3e635']

onMounted(() => {
    setupLucide()
})

function guardar() {
    if (!nombre.value || !descripcion.value || !color.value || !icono.value) {
        notif.notify('Campos obligatorios', 'warning');
        return;
    }

    const data = {
        nombre: nombre.value,
        descripcion: descripcion.value,
        color: color.value,
        icono: icono.value,
        created_at: new Date()
    }

    if (props.categoria) {
        emit('update', { id: props.categoria.id, ...data })
    } else {
        emit('save', data)
    }
}

watch(() => props.categoria, (newCategoria) => {
    if (newCategoria) {
        nombre.value = newCategoria.nombre;
        descripcion.value = newCategoria.descripcion;
        color.value = newCategoria.color;
        icono.value = newCategoria.icono;
    } else {
        nombre.value = '';
        descripcion.value = '';
        color.value = '';
        icono.value = '';
    }
}, { immediate: true })

function cerrarmodal() {
    nombre.value = '';
    descripcion.value = '';
    color.value = '';
    icono.value = '';

    emit('close');
}

const idEdit = computed(() => {
    return props.categoria ? props.categoria.id : null;
})
</script>

<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 420px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">
                        {{ idEdit ? 'Editar Categoría' : 'Nueva Categoría' }}
                    </h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar la categoría' : 'crear la categoría'}}</p>
                </div>
                <button @click="cerrarmodal"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-4">

                <!-- Username -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Nombre <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="between-horizontal-end" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input :value="nombre" @input="nombre = toUpperCase($event.target.value)" type="text" placeholder="Ej: Calzado"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                </div>
                <!-- Descripción -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Descripción <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="between-horizontal-end" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="descripcion" type="text" placeholder="Ej: Calzado"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                </div>
                <!-- Icono -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        icono <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="book-alert" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="icono" type="text" placeholder="Ej: house, settings, user"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                    <p class="text-xs field-hint flex items-center gap-1">
                        Selecciona un icono —
                        <a href="https://lucide.dev/icons/" target="_blank"
                            class="text-violet-400 hover:text-violet-300 underline underline-offset-2 flex items-center gap-1">
                            Ver iconos disponibles
                            <i data-lucide="external-link" class="w-3 h-3"></i>
                        </a>
                    </p>
                </div>
                <!-- Color -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Color <span class="field-required">*</span>
                    </label>

                    <!-- Paleta de colores -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <button v-for="c in COLORS" class="color-swatch" :class="{ 'color-active': color === c }"
                            :style="{ background: c, width: '26px', height: '26px' }" :title="c"
                            @click="color = c"></button>

                        <!-- Input hex manual -->
                        <div class="flex items-center gap-2 ml-auto">
                            <div class="color-preview rounded-lg border"
                                :style="{ background: color, width: '28px', height: '28px' }"></div>
                            <input v-model="color" type="text" value="#f87171" class="field-input px-2 py-1.5 rounded-lg border text-xs outline-none"
                                style="width: 90px;" />
                        </div>
                    </div>
                    <p class="text-xs field-hint">Selecciona un color o escribe el código hex</p>
                </div>

            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="cerrarmodal" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cancelar</button>
                <button @click="guardar"
                    class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="save" class="btn-icon w-4 h-4"></i> {{ idEdit ? 'Actualizar' : 'Guardar' }}
                </button>
            </div>

        </div>
    </div>
</template>