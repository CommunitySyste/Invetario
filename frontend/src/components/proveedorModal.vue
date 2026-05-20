<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'
import api from '../api/axios'
import { soloNumero, soloTelefono } from '../helper/inputHelper'

const props = defineProps({
    proveedor: Object
})
const emit = defineEmits(['close', 'save', 'update'])
const notif = useNotificationStore()
const nombre = ref('')
const telefono = ref('')
const email = ref('')
const direccion = ref('')
const estado = ref('')
const empresa = ref('')
const created_at = ref('');
const categoriasFiltrados = ref([]);

onMounted(() => {
    setupLucide()
})


async function guardar() {
    
    if (!nombre.value || !telefono.value || !email.value || !direccion.value || !estado.value || !empresa.value) {
        notif.notify('Campos obligatorios', 'warning')
        return
    }

    const data = {
        nombre: nombre.value,
        telefono: telefono.value,
        email: email.value,
        direccion: direccion.value,
        estado: estado.value,
        empresa: empresa.value
    }

    if (props.proveedor) {
        emit('update', { id: props.proveedor.id, ...data })
    } else {
        emit('save', data)
    }
}

watch(() => props.proveedor, (newProveedor) => {
    if (newProveedor) {
        nombre.value = newProveedor.nombre;
        telefono.value = newProveedor.telefono;
        email.value = newProveedor.email;
        direccion.value = newProveedor.direccion;
        empresa.value = newProveedor.empresa;
        estado.value = newProveedor.estado;
    } else {
        nombre.value = '';
        telefono.value = '';
        email.value = '';
        direccion.value = '';
        estado.value = '';
        empresa.value = '';
    }
}, { immediate: true })

function cerrarmodal() {
    nombre.value = '';
    telefono.value = '';
    email.value = '';
    direccion.value = '';
    estado.value = '';
    empresa.value = '';
    emit('close');
}

const idEdit = computed(() => {
    return props.proveedor  ? props.proveedor.id : null;
})


</script>

<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 780px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">
                        {{ idEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
                    </h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar el proveedor' : 'crear el proveedor' }}</p>
                </div>
                <button @click="cerrarmodal"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <div class="flex gap-6">

                <!-- Columna derecha: Campos en grid 2x2 -->
                <div class="flex flex-col gap-4 flex-1">

                    <!-- Fila 1: Nombre + Categoría -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Nombre <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="between-horizontal-end" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="nombre" @input="nombre = toUpperCase($event.target.value)" type="text"
                                    placeholder="Ej: Juan Pérez" class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Empresa S.A <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="building-2" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="empresa" @input="empresa = toUpperCase($event.target.value)" type="text"
                                    placeholder="Ej: Confecciones ML" class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Fila 2: Stock + Precio -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Telefono <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="phone" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="telefono" type="text" placeholder="Ej: +593 958 821 749"
                                    @input="telefono = soloTelefono($event.target.value)"
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                email <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="mail" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input v-model="email" type="text" placeholder="Ej: juan@textiles.com" 
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Fila 3: Estado + Descripción -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Dirección <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="map-pin-house" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input v-model="direccion" type="text" placeholder="Ej: Avenida Juan Pérez"
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Estado <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="toggle-right" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="estado" class="bg-transparent outline-none text-sm w-full cursor-pointer" style="color:#9490b0;">
                                    <option value="">Selecciona</option>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

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