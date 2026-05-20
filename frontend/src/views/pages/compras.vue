<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import compraModal from '../../components/compraModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'
import { formatearFecha } from '../../helper/fechaHelper'
import pdfComprasModal from '../../components/pdf/comprasPdfModal.vue'

const auth = useAuthStore()
const modalVisible = ref(false)
const compras = ref([])
const search = ref('')
const notif = useNotificationStore()
const confirmVisible = ref(false)
const compraAEliminar = ref(null)
const compraSeleccionada = ref(null)
const estadoSeleccionado = ref(null)
const modalPdfVisible = ref(false)
const pdfUrl = ref(null)
const pdfBlob = ref(null)
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getCompras() {
    try {
        const { data } = await api.get('/compras');
        compras.value = data;
        notif.notify('Compras recibidas exitosamente', 'success');
        nextTick(() => setupLucide())
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getCompras();
    setupLucide()
    estadoSeleccionado.value = ''
})

async function crearCompra() {
    modalVisible.value = false
    await getCompras()
    notif.notify('Compra creada exitosamente', 'success')
}

async function cambiarEstado(compra, estado) {
    try {
        await api.put(`/compras/${compra.id}`, { estado });
        compra.estado = estado;
        notif.notify('Estado actualizado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al actualizar el estado', 'error');
    }
}

async function eliminarCompra(compra) {
    confirmVisible.value = true;
    compraAEliminar.value = compra;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/compras/${compraAEliminar.value.id}`);
        await getCompras();
        confirmVisible.value = false;
        compraAEliminar.value = null;
        notif.notify('Compra eliminada exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar la compra', 'error');
    }
}

async function generarPDFCompras(id) {
    try {
        const res = await api.get(`/compras/pdf/${id}`, {
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
    link.download = `reporte_compras_${fecha}.pdf`;

    link.click();
}
const comprasFiltrados = computed(() => {
    return compras.value.filter(compra => {
        const matchSearch = compra.proveedorNombre.toLowerCase().includes(search.value.toLowerCase())
        const matchEstado = estadoSeleccionado.value ? compra.estado === estadoSeleccionado.value : true

        return matchSearch && matchEstado
    })
})

const totalPaginas = computed(() => {
    return Math.ceil(compras.value.length / itemsPorPagina);
})

const comprasPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return comprasFiltrados.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 text-white">
        <div>
            <h1 class="text-2xl font-semibold text-slate-100">Compras</h1>

        </div>
        <!-- Filtros y acciones -->
        <div class="flex flex-wrap gap-3 mb-6 items-center justify-between">
            <div class="flex gap-3 flex-wrap">

                <!-- Buscar -->
                <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                    <input v-model="search" type="text" placeholder="Buscar compra..."
                        class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
                </div>

                <!-- Filtro estado -->
                <select v-model="estadoSeleccionado"
                    class="bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>

            </div>

            <!-- Botón nueva compra -->
            <button @click="modalVisible = true" v-if="puedeCrear('compras')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 transition px-4 py-2 rounded-lg text-sm font-medium">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                Nueva Compra
            </button>
        </div>

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Compras</span>
                    <i data-lucide="shopping-bag" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{ compras.length }}</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Completadas</span>
                    <i data-lucide="circle-check" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">{{compras.filter(c => c.estado === 'completado').length}}
                </p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Pendientes</span>
                    <i data-lucide="clock" class="w-4 h-4 text-yellow-400"></i>
                </div>
                <p class="text-2xl font-bold text-yellow-400">{{compras.filter(c => c.estado === 'pendiente').length}}
                </p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Invertido</span>
                    <i data-lucide="dollar-sign" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">{{compras.reduce((sum, c) => sum + Number(c.total),
                    0).toFixed(2)}}</p>
            </div>

        </div>

        <!-- Tabla de compras -->
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">

            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 class="text-sm font-semibold text-white">Lista de Compras</h2>
                <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{{ compras.length }}
                    registros</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Proveedor</th>
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

                    <!-- Fila ejemplo 1 -->
                    <tr v-for="(c, index) in comprasPaginados" :key="c.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ (paginaActual - 1) * itemsPorPagina + index + 1}} </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-7 h-7 rounded-full bg-violet-700/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                                    {{ c.proveedorEmpresa.slice(0, 1).toUpperCase() }}</div>
                                <div class="flex flex-col">
                                    <span class="text-white text-sm font-medium">{{ c.proveedorEmpresa }}</span>
                                    <span class="text-gray-500 text-[11px]">{{ c.proveedorNombre }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-400">{{ c.usuarioNombre }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                {{ formatearFecha(c.fecha) }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-sm font-semibold text-white">{{ c.total }}</td>
                        <td class="px-5 py-3.5">
                            <select @change="cambiarEstado(c, $event.target.value)" :value="c.estado"
                                :disabled="!puedeEditar('compras')"
                                class="text-xs rounded-full px-2 py-0.5 outline-none cursor-pointer border font-medium"
                                :class="{
                                    'text-green-400 bg-green-400/10 border-green-400/20': c.estado === 'completado',
                                    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20': c.estado === 'pendiente',
                                    'text-red-400 bg-red-400/10 border-red-400/20': c.estado === 'cancelado'
                                }">
                                <option value="pendiente">Pendiente</option>
                                <option value="completado">Completado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button @click="generarPDFCompras(c.id)"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="eye" class="w-3 h-3"></i> Detalle
                                </button>
                                <button @click="eliminarCompra(c)" :disabled="!puedeEliminar('compras')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-red-600 hover:text-red-400 transition">
                                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <!-- Sin datos -->
                    <!--
          <tr>
            <td colspan="7" class="px-5 py-16 text-center">
              <div class="flex flex-col items-center gap-3 text-gray-500">
                <i data-lucide="shopping-cart" class="w-10 h-10 opacity-40"></i>
                <p class="text-sm">No hay compras registradas</p>
              </div>
            </td>
          </tr>
          -->

                </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex items-center justify-between px-5 py-3 border-t border-white/10 text-xs text-gray-500">
                <span>Mostrando {{ paginaActual * 10 }} - {{ (paginaActual * 10) + 10 }} de {{ totalRegistros }} registros</span>
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
        <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este compra?"
            @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
        <compraModal v-if="modalVisible" @close="() => { modalVisible = false; compraSeleccionada = null }"
            @save="crearCompra" />
        <pdfComprasModal v-if="modalPdfVisible" :pdfUrl="pdfUrl" @close="modalPdfVisible = false"
            @descargar="descargarPDF" />
    </div>
</template>
<style scoped></style>