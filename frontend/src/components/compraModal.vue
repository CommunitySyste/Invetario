<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
    proveedor: Object
})

const emit = defineEmits(['close', 'save', 'update'])
const proveedor_id = ref('')
const estado_compra = ref('')
const proveedor = ref([])
const productos = ref([])
const search = ref('')
const detalle = ref([])
const notif = useNotificationStore()
const auth = useAuthStore()

watch(proveedor_id, async (newId) => {
    if (!newId) {
        productos.value = []
        detalle.value = []
        return
    }
    try {
        const { data } = await api.get(`/productos/proveedor/${newId}`)
        productos.value = data
        detalle.value = []
    } catch (error) {
        notif.notify('Error al cargar productos del proveedor', 'error')
    }
})

const productosFiltrados = computed(() => {
    if (!search.value.trim()) return []
    return productos.value.filter(p =>
        p.nombre.toLowerCase().includes(search.value.toLowerCase())
    )
})

const total = computed(() => {
    return detalle.value.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)
})

function agregarProducto(producto) {
    const index = detalle.value.findIndex(d => d.producto_id === producto.id)
    if (index !== -1) {
        detalle.value[index].cantidad++
        detalle.value[index].subtotal = detalle.value[index].cantidad * detalle.value[index].precio_unitario
    } else {
        detalle.value.push({
            producto_id: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            precio_unitario: Number(producto.precio),
            subtotal: Number(producto.precio)
        })
    }
    search.value = ''
    nextTick(() => setupLucide())
}

function incrementar(index) {
    detalle.value[index].cantidad++
    detalle.value[index].subtotal = detalle.value[index].cantidad * detalle.value[index].precio_unitario
    nextTick(() => setupLucide())
}

function decrementar(index) {
    if (detalle.value[index].cantidad <= 1) return
    detalle.value[index].cantidad--
    detalle.value[index].subtotal = detalle.value[index].cantidad * detalle.value[index].precio_unitario
    nextTick(() => setupLucide())
}

function eliminarDetalle(index) {
    detalle.value.splice(index, 1)
    nextTick(() => setupLucide())
}

async function guardar() {
    if (!proveedor_id.value || !estado_compra.value || detalle.value.length === 0) {
        notif.notify('Completa todos los campos y agrega al menos un producto', 'warning')
        return
    }
    try {
        await api.post('/compras', {
            proveedor_id: proveedor_id.value,
            estado: estado_compra.value,
            detalle: detalle.value.map(d => ({
                producto_id: d.producto_id,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario
            }))
        })
        emit('save')
        cerrarmodal()
        notif.notify('Compra registrada exitosamente', 'success')
    } catch (error) {
        console.error(error)
        notif.notify('Error al registrar la compra', 'error')
    }
}

function cerrarmodal() {
    proveedor_id.value = ''
    estado_compra.value = ''
    detalle.value = []
    search.value = ''
    productos.value = []
    emit('close')
}

async function getProveedores() {
    try {
        const { data } = await api.get('/proveedores')
        proveedor.value = data
    } catch (error) {
        notif.notify('Error al cargar proveedores', 'error')
    }
}

onMounted(() => {
    setupLucide()
    getProveedores()
})
</script>

<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60">
        <div class="bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 w-full"
            style="max-width: 860px; max-height: 90vh; overflow-y: auto;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">
                        {{ idEdit ? 'Editar compra' : 'Nueva compra' }}
                    </h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar el compra':'crear la compra' }}</p>
                </div>
                <button @click="cerrarmodal"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <div class="flex gap-6">

                <!-- Columna derecha: Campos en grid 2x2 -->
                <div class="flex flex-col gap-4 flex-1">

                    <!-- Fila 1: Nombre + Categoría -->
                    <!-- Proveedor + Estado -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest text-gray-400">Proveedor <span
                                    class="text-red-400">*</span></label>
                            <div
                                class="bg-[#13131f] border border-white/10 flex items-center gap-2 px-3 py-2.5 rounded-xl">
                                <i data-lucide="truck" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="proveedor_id"
                                    class="bg-transparent outline-none text-sm w-full cursor-pointer text-gray-300">
                                    <option value="">Selecciona proveedor</option>
                                    <option v-for="p  in proveedor" :key="p .id" :value="p .id">
                                        {{ p .nombre }} </option>
                                </select>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest text-gray-400">Estado <span
                                    class="text-red-400">*</span></label>
                            <div
                                class="bg-[#13131f] border border-white/10 flex items-center gap-2 px-3 py-2.5 rounded-xl">
                                <i data-lucide="toggle-right" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="estado_compra" class="bg-transparent outline-none text-sm w-full cursor-pointer text-gray-300">
                                    <option value="">Selecciona estado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Buscador de productos -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-medium uppercase tracking-widest text-gray-400">Agregar
                            Producto</label>
                        <div class="flex gap-2">
                            <div
                                class="flex items-center gap-2 bg-[#13131f] border border-white/10 rounded-xl px-3 py-2.5 flex-1">
                                <i data-lucide="search" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input v-model="search" type="text" placeholder="Buscar producto por nombre..."
                                    class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full" />
                            </div>
                        </div>

                        <!-- Dropdown resultados -->
                        <div v-if="productosFiltrados.length > 0"
                            class="bg-[#13131f] border border-white/10 rounded-xl overflow-hidden">
                            <div v-for="producto in productosFiltrados" :key="producto.id"
                                @click="agregarProducto(producto)"
                                class="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-0">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-lg overflow-hidden bg-violet-700/20 flex items-center justify-center shrink-0">
                                        <img v-if="producto.imagen"
                                            :src="`http://localhost:3000/uploads/productos/${producto.imagen}`"
                                            class="w-full h-full object-cover" />
                                        <i v-else data-lucide="package" class="w-4 h-4 text-violet-400"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm text-white font-medium">{{ producto.nombre }}</p>
                                        <p class="text-[11px] text-gray-500">Stock: {{ producto.stock }} | ${{
                                            producto.precio }}</p>
                                    </div>
                                </div>
                                <i data-lucide="plus-circle" class="w-4 h-4 text-violet-400"></i>
                            </div>
                        </div>

                        <!-- Sin resultados -->
                        <div v-else-if="search.trim() && productosFiltrados.length === 0"
                            class="bg-[#13131f] border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-500 text-center">
                            No se encontró ningún producto
                        </div>
                    </div>

                    <!-- Tabla productos agregados -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-medium uppercase tracking-widest text-gray-400">Productos en esta
                            compra</label>
                        <div class="bg-[#13131f] border border-white/10 rounded-xl overflow-hidden">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-white/10">
                                        <th
                                            class="px-4 py-2.5 text-left text-[11px] text-slate-500 uppercase tracking-wider">
                                            Producto</th>
                                        <th
                                            class="px-4 py-2.5 text-left text-[11px] text-slate-500 uppercase tracking-wider">
                                            Precio Unit.</th>
                                        <th
                                            class="px-4 py-2.5 text-left text-[11px] text-slate-500 uppercase tracking-wider">
                                            Cantidad</th>
                                        <th
                                            class="px-4 py-2.5 text-left text-[11px] text-slate-500 uppercase tracking-wider">
                                            Subtotal</th>
                                        <th class="px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="detalle.length === 0">
                                        <td colspan="5" class="px-4 py-6 text-center text-xs text-gray-500">
                                            Agrega productos a la compra
                                        </td>
                                    </tr>
                                    <tr v-for="(item, i) in detalle" :key="item.producto_id"
                                        class="border-b border-white/5 hover:bg-white/5 transition">
                                        <td class="px-4 py-3 text-sm text-white font-medium">{{ item.nombre }}</td>
                                        <td class="px-4 py-3 text-sm text-slate-400">${{ item.precio_unitario.toFixed(2)
                                        }}</td>
                                        <td class="px-4 py-3">
                                            <div class="flex items-center gap-2">
                                                <button @click="decrementar(i)"
                                                    class="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                                                    <i data-lucide="minus" class="w-3 h-3"></i>
                                                </button>
                                                <span class="text-sm text-white w-6 text-center">{{ item.cantidad
                                                }}</span>
                                                <button @click="incrementar(i)"
                                                    class="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                                                    <i data-lucide="plus" class="w-3 h-3"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-sm font-semibold text-violet-400">${{
                                            item.subtotal.toFixed(2) }}</td>
                                        <td class="px-4 py-3">
                                            <button @click="eliminarDetalle(i)"
                                                class="text-slate-500 hover:text-red-400 transition">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <!-- Total -->
                            <div
                                class="flex items-center justify-end gap-4 px-4 py-3 border-t border-white/10 bg-white/5">
                                <span class="text-sm text-gray-400">Total:</span>
                                <span class="text-lg font-bold text-white">${{ total }}</span>
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