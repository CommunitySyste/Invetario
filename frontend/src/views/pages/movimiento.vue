<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'
import movimientoModal from '../../components/movimientoModal.vue'
import { formatearFecha } from '../../helper/fechaHelper'
import pdfMovimientosModal from '../../components/pdf/movimientosPdfModal.vue'

const movimientos = ref([])
const search = ref('')
const tipoFiltro = ref('')
const fechaFiltro = ref('')
const notif = useNotificationStore()
const modalVisible = ref(false)
const paginaActual = ref(1)
const porPaginas = 10
const modalPdfVisible = ref(false)
const pdfUrl = ref(null)
const pdfBlob = ref(null)

onMounted(async () => {
    await getMovimientos();
    await setupLucide();
})

async function getMovimientos() {
    try {
        const { data } = await api.get('/movimientos');
        movimientos.value = data;
        notif.notify('Movimientos recibidos exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

const movimientosFiltrados = computed(() => {
    return movimientos.value.filter(m => {
        const matchSearch = m.productoNombre.toLowerCase().includes(search.value.toLowerCase());
        const matchTipo = tipoFiltro.value ? m.tipo === tipoFiltro.value : true;
        const macthFecha = fechaFiltro.value ? m.fecha?.slice(0, 10) === fechaFiltro.value : true;

        return matchSearch && matchTipo && macthFecha;
    })
})

async function abrirMovimiento() {
    modalVisible.value = true;
}

async function recargar() {
    obtenerMovimientos();
}

const totalEntradas = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + Number(m.cantidad || 0), 0);
});

const totalSalidas = computed(() => {
    return movimientos.value
        .filter(m => m.tipo === 'salida')
        .reduce((sum, m) => sum + Number(m.cantidad || 0), 0);
});

const totalMes = computed(() => {
    const hoy = new Date();
    return movimientos.value.filter(m => {
        const fecha = new Date(m.fecha || m.created_at);
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;
})

const movimientosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * porPaginas;
    return movimientosFiltrados.value.slice(inicio, inicio + porPaginas);
});

const totalPaguinas = computed(() => {
    return Math.ceil(movimientos.value.length / porPaginas);
})

watch([search, tipoFiltro, fechaFiltro], () => {
    paginaActual.value = 1;
});

async function generarPDFMovimiento(id) {
    try {
        const res = await api.get(`/movimientos/pdf/${id}`, {
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

    const fecha = new Date().toISOString().slice(0,10);
    link.download = `reporte_movimientos_${fecha}.pdf`;

    link.click();
}
</script>
<template>
    <div class="p-6 text-white">

        <!-- Filtros y acciones -->
        <div class="flex flex-wrap gap-3 mb-6 items-center justify-between">

            <div class="flex gap-3 flex-wrap">
                <!-- Buscar -->
                <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                    <input v-model="search" type="text" placeholder="Buscar movimiento..."
                        class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
                </div>

                <!-- Filtro tipo -->
                <select v-model="tipoFiltro"
                    class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                    <option value="">Todos los tipos</option>
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                </select>

                <!-- Filtro fecha -->
                <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                    <i data-lucide="calendar" class="w-4 h-4 text-gray-400"></i>
                    <input v-model="fechaFiltro" type="date"
                        class="bg-transparent text-sm text-gray-300 outline-none" />
                </div>
            </div>

            <!-- Botón nuevo -->
            <button @click="abrirMovimiento" v-if="puedeCrear('movimiento')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 transition px-4 py-2 rounded-lg text-sm font-medium">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Nuevo Movimiento
            </button>
        </div>

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Movimientos</span>
                    <i data-lucide="activity" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{movimientos.length}}</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Entradas</span>
                    <i data-lucide="trending-up" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">{{ totalEntradas }}</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Salidas</span>
                    <i data-lucide="trending-down" class="w-4 h-4 text-red-400"></i>
                </div>
                <p class="text-2xl font-bold text-red-400">{{ totalSalidas }}</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Este mes</span>
                    <i data-lucide="calendar-check" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">{{ totalMes }}</p>
            </div>

        </div>
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <div class="flex items-center justify-between px-5 py-4 border-b border-[#2d2d45]">
                <span class="text-sm font-medium text-slate-100">Lista de Movimientos</span>
                <span class="text-xs text-slate-500 bg-[#1e1e30] rounded-full px-3 py-0.5">
                    registros {{ movimientos.length }}</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Producto</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Tipo</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Cantidad</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Usuario</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Fecha</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(mov, index) in movimientosPaginados" :key="mov.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ index + 1 }}</td>
                        <td class="px-5 py-3.5">
                            <span class="text-white font-medium">{{ mov.productoNombre }}</span>
                        </td>
                        <td class="px-5 py-3.5">
                            <span v-if="mov.tipo === 'entrada'"
                                class="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full w-fit text-xs font-medium">
                                <i data-lucide="arrow-down-circle" class="w-3 h-3"></i> Entrada
                            </span>

                            <span v-else
                                class="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full w-fit text-xs font-medium">
                                <i data-lucide="arrow-up-circle" class="w-3 h-3"></i> Salida
                            </span>
                        </td>
                        <td class="px-5 py-3.5 text-sm font-medium"
                            :class="mov.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'">
                            {{ mov.tipo === 'entrada' ? '+' : '-' }}{{ mov.cantidad }}
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ mov.usuarioNombre }}</td>
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatearFecha(mov.created_at) }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button v-if="puedeVer('movimientos')" @click="generarPDFMovimiento(mov.id)"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="file-text" class="w-3 h-3"></i> PDF
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex items-center justify-between px-5 py-3.5 border-t border-[#2d2d45]">
                <span class="text-xs text-slate-500">Mostrando {{ (paginaActual - 1) * porPaginas + 1 }}–{{
                    (paginaActual - 1) * porPaginas + movimientosPaginados.length }} de
                    {{ movimientos.length }} registros</span>
                <div class="flex gap-1">
                    <button @click="paginaActual" :disabled="paginaActual === 1"
                        class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1"
                        :class="paginaActual === 1
                            ? 'bg-[#1a1a2e] text-slate-600 border-[#2d2d45]'
                            : 'bg-[#1a1a2e] text-slate-400 border-[#2d2d45] hover:border-violet-600 hover:text-violet-400'">‹</button>
                    <button v-for="page in totalPaguinas" :key="page" @click="paginaActual = page"
                        class="text-xs text-white bg-violet-700 border border-violet-700 rounded-md px-2.5 py-1"
                        :class="paginaActual === page
                            ? 'bg-violet-700 text-white border-violet-700'
                            : 'bg-[#1a1a2e] text-slate-400 border-[#2d2d45] hover:border-violet-600 hover:text-violet-400'">{{ page }}</button>
                    <button @click="paginaActual++" :disabled="paginaActual === totalPaguinas"
                        class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1"
                        :class="paginaActual === totalPaginas
                ? 'bg-[#1a1a2e] text-slate-600 border-[#2d2d45]'
                : 'bg-[#1a1a2e] text-slate-400 border-[#2d2d45] hover:border-violet-600 hover:text-violet-400'">›</button>
                </div>
            </div>
        </div>
        <movimientoModal v-if="modalVisible" @close="modalVisible = false" @save="recargar" @update="recargar" />
        <pdfMovimientosModal v-if="modalPdfVisible" :pdfUrl="pdfUrl" @close="modalPdfVisible = false" @descargar="descargarPDF" />
    </div>
</template>
<style scoped></style>