<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import ventaModal from '../../components/ventasModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { formatearFecha } from '../../helper/fechaHelper'
import pdfVentasModal from '../../components/pdf/ventasPdfModal.vue'
import { puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'

const notif = useNotificationStore()
const modalVisible = ref(false)
const ventas = ref([])
const confirmVisible = ref(false)
const ventaAEliminar = ref(null)
const search = ref('')
const estadoSeleccionado = ref('')
const modalPdfVisible = ref(false)
const pdfUrl = ref(null)
const pdfBlob = ref(null)
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getVentas() {
    try {
        const { data } = await api.get('/ventas')
        ventas.value = data
        notif.notify('Ventas recibidas exitosamente', 'success')
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error')
    }
}

async function crearVenta() {
    modalVisible.value = false
    await getVentas()
}

async function eliminarVenta(venta) {
    confirmVisible.value = true
    ventaAEliminar.value = venta
}

async function confirmarEliminar() {
    try {
        await api.delete(`/ventas/${ventaAEliminar.value.id}`)
        await getVentas()
        confirmVisible.value = false
        ventaAEliminar.value = null
        notif.notify('Venta eliminada exitosamente', 'success')
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al eliminar la venta', 'error')
    }
}

async function cambiarEstado(venta, nuevoEstado) {
    try {
        await api.put(`/ventas/${venta.id}`, { estado: nuevoEstado })
        await getVentas()
        notif.notify('Estado actualizado', 'success')
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al actualizar estado', 'error')
    }
}

onMounted(async () => {
    await getVentas()
    estadoSeleccionado.value = ''
})

const ventasFiltrados = computed(() => {
    return ventas.value.filter(venta => {
        const matchSearch = search.value.trim()
            ? venta.usuarioNombre?.toLowerCase().includes(search.value.toLowerCase())
            : true
        const matchEstado = estadoSeleccionado.value
            ? venta.estado === estadoSeleccionado.value
            : true
        return matchSearch && matchEstado
    })
})

async function generarPDFVenta(id) {
    try {
        const res = await api.get(`/ventas/pdf/${id}`, {
            responseType: 'blob'
        });

        const blob = new Blob([res.data], { type: 'application/pdf' });
        pdfBlob.value = blob;
        pdfUrl.value = URL.createObjectURL(blob);

        modalPdfVisible.value = true;

    } catch (error) {
        console.error(error);
        notif.notify('Error al generar el pdf', 'error');
    }
}

function descargarPDF() {
    if (!pdfBlob.value) return;

    const url = URL.createObjectURL(pdfBlob.value);

    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date().toISOString().slice(0, 10);
    link.download = `reporte_ventas_${fecha}.pdf`;

    link.click();
}

const totalPaginas = computed(() => {
    return Math.ceil(ventas.value.length / itemsPorPagina);
})

const ventasPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return ventasFiltrados.value.slice(inicio, fin);
})
</script>

<template>
    <div class="p-6 text-white">
        <div>
            <h1 class="text-2xl font-semibold text-slate-100">Ventas</h1>

        </div>
        <!-- Filtros y acciones -->
        <div class="flex flex-wrap gap-3 mb-6 items-center justify-between">
            <div class="flex gap-3 flex-wrap">
                <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                    <input v-model="search" type="text" placeholder="Buscar venta..."
                        class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
                </div>
                <select v-model="estadoSeleccionado"
                    class="bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>
            <button @click="modalVisible = true" v-if="puedeCrear('ventas')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 transition px-4 py-2 rounded-lg text-sm font-medium">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Nueva Venta
            </button>
        </div>

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Ventas</span>
                    <i data-lucide="shopping-bag" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{ ventas.length }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Completadas</span>
                    <i data-lucide="circle-check" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">{{ventas.filter(v => v.estado === 'completado').length}}
                </p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Pendientes</span>
                    <i data-lucide="clock" class="w-4 h-4 text-yellow-400"></i>
                </div>
                <p class="text-2xl font-bold text-yellow-400">{{ventas.filter(v => v.estado === 'pendiente').length}}
                </p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Vendido</span>
                    <i data-lucide="dollar-sign" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">${{ventas.reduce((s, v) => s + Number(v.total),
                    0).toFixed(2) }}</p>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">

            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 class="text-sm font-semibold text-white">Lista de Ventas</h2>
                <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{{ ventas.length }}
                    registros</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Usuario</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Fecha</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Total</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Estado</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="ventas.length === 0">
                        <td colspan="6" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3 text-gray-500">
                                <i data-lucide="shopping-bag" class="w-10 h-10 opacity-40"></i>
                                <p class="text-sm">No hay ventas registradas</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-for="(v, index) in ventasPaginados" :key="v.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ index + 1 }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-7 h-7 rounded-full bg-violet-700/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                                    {{ v.usuarioNombre?.slice(0, 1).toUpperCase() }}
                                </div>
                                <span class="text-white text-sm font-medium">{{ v.usuarioNombre }}</span>
                            </div>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                {{ formatearFecha(v.fecha) }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-sm font-semibold text-white">${{ Number(v.total).toFixed(2) }}</td>
                        <td class="px-5 py-3.5">
                            <select @change="cambiarEstado(v, $event.target.value)" :value="v.estado"
                                class="text-xs rounded-full px-2 py-0.5 outline-none cursor-pointer border font-medium"
                                :class="{
                                    'text-green-400 bg-green-400/10 border-green-400/20': v.estado === 'completado',
                                    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20': v.estado === 'pendiente',
                                    'text-red-400 bg-red-400/10 border-red-400/20': v.estado === 'cancelado'
                                }">
                                <option value="pendiente">Pendiente</option>
                                <option value="completado">Completado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button @click="generarPDFVenta(v.id)" v-if="puedeEditar('ventas')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="eye" class="w-3 h-3"></i> Detalle
                                </button>
                                <button @click="eliminarVenta(v)" :disabled="!puedeEliminar('ventas')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-red-600 hover:text-red-400 transition">
                                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex items-center justify-between px-5 py-3 border-t border-white/10 text-xs text-gray-500">
                <span>Mostrando {{ ventas.length }} registros</span>
                <div class="flex gap-1">
                    <button class="text-xs text-white bg-violet-700 border border-violet-700 rounded-md px-2.5 py-1"
                        :disabled="paginaActual === 1" @click="paginaActual--">← Anterior</button>
                    <button class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1"
                        v-for="page in totalPaginas" :key="page" @click="paginaActual = page"
                        :class="{ 'bg-[#1a1a2e] text-slate-600 border-[#2d2d45]': paginaActual === page }">{{ page
                        }}</button>
                    <button class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1"
                        :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente →</button>
                </div>
            </div>
        </div>

        <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar esta venta?"
            @cancel="confirmVisible = false" @confirm="confirmarEliminar" />

        <ventaModal v-if="modalVisible" @close="modalVisible = false" @save="crearVenta" />
        <pdfVentasModal v-if="modalPdfVisible" :pdfUrl="pdfUrl" @close="modalPdfVisible = false"
            @descargar="descargarPDF" />
    </div>
</template>