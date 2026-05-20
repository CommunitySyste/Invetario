<script setup>
import { ref, watch } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'

const emit = defineEmits(['close', 'save'])
const notif = useNotificationStore()

const COLORS = ['#FF2C2C', '#b899f5', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#a3e635']

const form = ref({
    nombre: '',
    color: '#b899f5'
})
const colorSeleccionado = ref('#FF2C2C')

function guardar() {
    if (!form.value.nombre || !form.value.color) {
        notif.notify('Por favor, rellena todos los campos', 'warning');
        return;
    }
    if (!/^#[0-9A-F]{6}$/i.test(form.value.color)) {
        notif.notify('Color inválido (usa formato HEX)', 'warning');
        return
    }
    if (props.rol){
        emit('update', {id: props.rol.id, ...form.value});
    } else {
        emit('save', form.value);
    }
}

const props = defineProps({
    rol: {
        type: Object,
        default: null
    }
})

watch(() => props.rol, (newRol) => {
    if (newRol) {
        form.value = {
            nombre: newRol.nombre,
            color: newRol.color
        }
    }
}, {immediate: true})
</script>
<template>
    <!-- Overlay fondo -->
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">

        <!-- Modal -->
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 420px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">
                    {{ props.rol ? 'Editar Rol' : 'Nuevo Rol' }}
                    </h2>
                    <p class="text-xs modal-sub">Completa los campos para crear el rol</p>
                </div>
                <button @click="emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <!-- Divider -->
            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-4">

                <!-- Nombre -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Nombre del rol <span class="field-required">*</span>
                    </label>
                    <input v-model="form.nombre" @input="e => form.nombre = toUpperCase(e.target.value)" type="text" placeholder="Ej: VENDEDOR"
                        class="field-input px-3 py-2.5 rounded-xl border text-sm outline-none w-full" />
                    <p class="text-xs field-hint">Solo letras mayúsculas, sin espacios</p>
                </div>

                <!-- Color -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Color <span class="field-required">*</span>
                    </label>

                    <!-- Paleta de colores -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <button v-for="c in COLORS" class="color-swatch" :class="{ 'color-active': form.color === c }"
                            :style="{ background: c, width: '26px', height: '26px' }" :title="c"
                            @click="form.color = c"></button>

                        <!-- Input hex manual -->
                        <div class="flex items-center gap-2 ml-auto">
                            <div class="color-preview rounded-lg border"
                                :style="{ background: form.color, width: '28px', height: '28px' }"></div>
                            <input v-model="form.color" type="text" value="#f87171" class="field-input px-2 py-1.5 rounded-lg border text-xs outline-none"
                                style="width: 90px;" />
                        </div>
                    </div>

                    <p class="text-xs field-hint">Selecciona un color o escribe el código hex</p>
                </div>

            </div>

            <!-- Divider -->
            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="emit('close')" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cancelar</button>
                <button @click="guardar"class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="save" class="btn-icon w-5 h-5"></i> {{ props.rol ? 'Actualizar' : 'Guardar' }}
                </button >
            </div>

        </div>
    </div>
</template>