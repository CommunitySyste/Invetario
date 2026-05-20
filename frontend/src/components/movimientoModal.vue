<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useNotificationStore } from '../stores/toastNotify'
import api from '../api/axios'
import { setupLucide } from '../assets/js/lucide'
import {useAuthStore} from '../stores/auth'

const emit = defineEmits(['close', 'save', 'update'])
const notif = useNotificationStore()
const productos = ref([])
const producto_id = ref('')
const tipo = ref('entrada')
const cantidad = ref('')
const fecha = ref('')
const motivo = ref('')
const auth = useAuthStore()

async function getProductos() {
    try {
        const { data } = await api.get('/productos');
        productos.value = data;
        notif.notify('Productos recibidos exitosamente', 'success');
    } catch (error) {
        console.error(error);
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getProductos();
})

async function guardar() {
    if (!producto_id.value || !cantidad.value) {
        notif.notify('Campos obligatorios', 'warning');
        return;
    }

    if (cantidad.value < 0) {
        notif.notify('Cantidad incorrecta', 'warning');
        return;
    }

    try {
        await api.post('/movimientos', {
            producto_id: producto_id.value,
            tipo: tipo.value,
            cantidad: cantidad.value,
            motivo: motivo.value,
            usuario_id: auth.user.id
        });
        notif.notify('Movimiento creado exitosamente', 'success');
        emit('close');
        cerrar();
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el movimiento', 'error');
    }
}

function cerrar() {
    producto_id.value = '';
    tipo.value = 'entrada';
    cantidad.value = '';
    fecha.value = '';
    motivo.value = '';
    emit('close');
}
</script>
<template>
<div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">

    <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full max-w-lg">

        <!-- HEADER -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-white">Nuevo Movimiento</h2>
                <p class="text-xs text-slate-400">Registrar entrada o salida de inventario</p>
            </div>
            <button @click="cerrar"
                class="w-8 h-8 rounded-lg flex items-center justify-center border text-slate-400">
                ✕
            </button>
        </div>

        <div class="border-t border-[#2d2d45]"></div>

        <!-- FORM -->
        <div class="flex flex-col gap-4">

            <!-- Producto -->
            <div>
                <label class="text-xs text-slate-400">Producto</label>
                <select v-model="producto_id"
                    class="w-full mt-1 bg-[#1a1a2e] border border-[#2d2d45] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="">Seleccionar producto</option>
                    <option v-for="p in productos" :key="p.id" :value="p.id">
                        {{ p.nombre }} (Stock: {{ p.stock }})
                    </option>
                </select>
            </div>

            <!-- Tipo -->
            <div>
                <label class="text-xs text-slate-400">Tipo</label>
                <select v-model="tipo"
                    class="w-full mt-1 bg-[#1a1a2e] border border-[#2d2d45] rounded-lg px-3 py-2 text-sm text-white">
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                </select>
            </div>

            <!-- Cantidad -->
            <div>
                <label class="text-xs text-slate-400">Cantidad</label>
                <input v-model="cantidad" type="number"
                    class="w-full mt-1 bg-[#1a1a2e] border border-[#2d2d45] rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Ej: 10" />
            </div>

            <!-- Motivo -->
            <div>
                <label class="text-xs text-slate-400">Motivo (opcional)</label>
                <textarea v-model="motivo"
                    class="w-full mt-1 bg-[#1a1a2e] border border-[#2d2d45] rounded-lg px-3 py-2 text-sm text-white"
                    rows="2"
                    placeholder="Ej: compra, venta, ajuste..."></textarea>
            </div>

        </div>

        <div class="border-t border-[#2d2d45]"></div>

        <!-- FOOTER -->
        <div class="flex justify-end gap-3">
            <button @click="cerrar"
                class="px-4 py-2 text-sm border rounded-lg text-slate-400">
                Cancelar
            </button>

            <button @click="guardar"
                class="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-800 rounded-lg text-sm text-white">
                <i data-lucide="save" class="w-4 h-4"></i>
                Guardar
            </button>
        </div>

    </div>
</div>
</template>
<style scoped></style>