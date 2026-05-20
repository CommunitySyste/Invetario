<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toCapitalize } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'
import api from '../api/axios'

const emit = defineEmits(['close', 'save', 'update'])
const form = ref({
  nombre: '',
  ruta: '',
  icono: '',
  orden: 1
})

const props = defineProps({
  submenu: Object
})

watch(() => props.submenu, (val) => {
  if (val) {
    form.value = { ...val }
  } else {
    form.value = {
      nombre: '',
      ruta: '',
      icono: '',
      orden: 1
    }
  }
}, { immediate: true })

function guardar(){
  if (props.submenu){
    emit('update', { id: props.submenu.id, ...form.value })
  } else {
    emit('save', form.value)
  }
}

const idEdit = computed(() => {
  return props.submenu ? props.submenu.id : null
})
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 420px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">{{ idEdit ? 'Editar Submenu' : 'Nuevo Submenu' }}</h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar el submenu' : 'crear el submenu'}}</p>
                </div>
                <button @click="emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-4">

                <!-- Username -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Nombre del menu <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="between-horizontal-end" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input :value="form.nombre" @input="form.nombre = toCapitalize($event.target.value)" type="text" placeholder="Ej: dashboard"
                            class="bg-transparent outline-none text-sm w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-medium uppercase tracking-widest field-label">
                        Ruta <span class="field-required">*</span>
                    </label>
                    <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                        <i data-lucide="route" class="w-4 h-4 text-gray-400 shrink-0"></i>
                        <input v-model="form.ruta" type="text" placeholder="Ej: index, user, menus"
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
                        <input v-model="form.icono" type="text" placeholder="Ej: house, settings, user"
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
            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="emit('close')" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cancelar</button>
                <button @click="guardar"
                    class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="save" class="btn-icon w-4 h-4"></i> {{ idEdit ? 'Actualizar' : 'Guardar' }}
                </button>
            </div>

        </div>
    </div>
</template>