<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import { setupLucide } from '../../assets/js/lucide'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const notif = useNotificationStore()

const general      = ref([])
const stockBajo    = ref([])
const porCategoria = ref([])
const resumen      = ref({})
const search       = ref('')
const estadoFiltro = ref('')

let chartDonut  = null
let chartBarras = null

async function cargar() {
    try {
        const { data } = await api.get('/stock')
        general.value      = data.general
        stockBajo.value    = data.stockBajo
        porCategoria.value = data.porCategoria
        resumen.value      = data.resumen
        notif.notify('Reporte cargado exitosamente', 'success')
        await nextTick()
        setupLucide()
        renderCharts()
    } catch (error) {
        notif.notify('Error al cargar stock', 'error')
    }
}

function renderCharts() {
    if (chartDonut) chartDonut.destroy()
    const ctxDonut = document.getElementById('chartDonutStock')
    if (ctxDonut) {
        chartDonut = new Chart(ctxDonut, {
            type: 'doughnut',
            data: {
                labels: ['Stock OK', 'Stock Bajo', 'Sin Stock'],
                datasets: [{
                    data: [
                        resumen.value.stock_ok   || 0,
                        resumen.value.stock_bajo  || 0,
                        resumen.value.sin_stock   || 0
                    ],
                    backgroundColor: ['#43a047', '#fb8c00', '#e53935'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
                cutout: '70%'
            }
        })
    }
    if (chartBarras) chartBarras.destroy()
    const ctxBarras = document.getElementById('chartBarrasStock')
    if (ctxBarras) {
        chartBarras = new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: porCategoria.value.map(c => c.categoria),
                datasets: [
                    {
                        label: 'Unidades en stock',
                        data: porCategoria.value.map(c => c.total_stock),
                        backgroundColor: 'rgba(99,102,241,0.7)',
                        borderRadius: 6
                    },
                    {
                        label: 'Valor ($)',
                        data: porCategoria.value.map(c => Number(c.valor_total).toFixed(2)),
                        backgroundColor: 'rgba(59,130,246,0.5)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: {
                    x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
                    y: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } }
                }
            }
        })
    }
}

const productosFiltrados = computed(() => {
    return general.value.filter(p => {
        const matchSearch = search.value.trim()
            ? p.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
              p.categoria?.toLowerCase().includes(search.value.toLowerCase())
            : true
        const matchEstado = estadoFiltro.value
            ? estadoFiltro.value === 'sin_stock'   ? p.stock === 0
            : estadoFiltro.value === 'stock_bajo'  ? p.stock > 0 && p.stock <= 10
            : estadoFiltro.value === 'stock_ok'    ? p.stock > 10
            : true
            : true
        return matchSearch && matchEstado
    })
})

import { nextTick } from 'vue'
onMounted(() => cargar())
</script>

<template>
    <div class="p-6 text-white flex flex-col gap-6">

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Productos</span>
                    <i data-lucide="package" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{ resumen.total_productos || 0 }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Stock</span>
                    <i data-lucide="layers" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">{{ resumen.total_stock || 0 }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Valor Total</span>
                    <i data-lucide="dollar-sign" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">${{ Number(resumen.valor_inventario || 0).toFixed(2) }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Stock OK</span>
                    <i data-lucide="circle-check" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">{{ resumen.stock_ok || 0 }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Stock Bajo</span>
                    <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-400"></i>
                </div>
                <p class="text-2xl font-bold text-orange-400">{{ resumen.stock_bajo || 0 }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Sin Stock</span>
                    <i data-lucide="circle-x" class="w-4 h-4 text-red-400"></i>
                </div>
                <p class="text-2xl font-bold text-red-400">{{ resumen.sin_stock || 0 }}</p>
            </div>
        </div>

        <!-- Gráficas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5">
                <h3 class="text-sm font-semibold text-white mb-4">Estado del Stock</h3>
                <div class="flex items-center justify-center" style="height: 200px;">
                    <canvas id="chartDonutStock"></canvas>
                </div>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5 md:col-span-2">
                <h3 class="text-sm font-semibold text-white mb-4">Stock por Categoría</h3>
                <div style="height: 200px;">
                    <canvas id="chartBarrasStock"></canvas>
                </div>
            </div>
        </div>

        <!-- Alerta stock bajo -->
        <div v-if="stockBajo.length > 0" class="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-400"></i>
                <span class="text-sm font-semibold text-orange-400">
                    {{ stockBajo.length }} producto(s) con stock bajo (≤ 10 unidades)
                </span>
            </div>
            <div class="flex flex-wrap gap-2">
                <span v-for="p in stockBajo" :key="p.nombre"
                    class="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                    <i data-lucide="package" class="w-3 h-3"></i>
                    {{ p.nombre }} — <strong>{{ p.stock }}</strong> uds
                </span>
            </div>
        </div>

        <!-- Filtros tabla -->
        <div class="flex flex-wrap gap-3 items-center">
            <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                <input v-model="search" type="text" placeholder="Buscar producto o categoría..."
                    class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-52" />
            </div>
            <select v-model="estadoFiltro"
                class="bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                <option value="">Todos</option>
                <option value="stock_ok">Stock OK</option>
                <option value="stock_bajo">Stock Bajo</option>
                <option value="sin_stock">Sin Stock</option>
            </select>
        </div>

        <!-- Tabla -->
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 class="text-sm font-semibold text-white">Inventario de Productos</h2>
                <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                    {{ productosFiltrados.length }} registros
                </span>
            </div>
            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Proveedor</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Precio</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Valor Total</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estado Stock</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="productosFiltrados.length === 0">
                        <td colspan="7" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3 text-gray-500">
                                <i data-lucide="inbox" class="w-10 h-10 opacity-40"></i>
                                <p class="text-sm">No hay productos</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-for="p in productosFiltrados" :key="p.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <div class="w-7 h-7 rounded-lg overflow-hidden bg-violet-700/20 flex items-center justify-center shrink-0">
                                    <img v-if="p.imagen"
                                        :src="`http://localhost:3000/uploads/productos/${p.imagen}`"
                                        class="w-full h-full object-cover" />
                                    <i v-else data-lucide="package" class="w-3.5 h-3.5 text-violet-400"></i>
                                </div>
                                <span class="text-sm text-white font-medium">{{ p.nombre }}</span>
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-400">{{ p.categoria }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-400">{{ p.proveedor }}</span>
                                <span class="text-[11px] text-gray-600">{{ p.empresa }}</span>
                            </div>
                        </td>
                        <td class="px-5 py-3.5">
                            <span class="text-sm font-bold"
                                :class="p.stock === 0 ? 'text-red-400'
                                    : p.stock <= 10 ? 'text-orange-400'
                                    : 'text-green-400'">
                                {{ p.stock }}
                            </span>
                        </td>
                        <td class="px-5 py-3.5 text-sm text-slate-400">${{ Number(p.precio).toFixed(2) }}</td>
                        <td class="px-5 py-3.5 text-sm font-semibold text-violet-400">
                            ${{ Number(p.valor_total).toFixed(2) }}
                        </td>
                        <td class="px-5 py-3.5">
                            <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                                :class="p.stock === 0
                                    ? 'text-red-400 bg-red-400/10'
                                    : p.stock <= 10
                                    ? 'text-orange-400 bg-orange-400/10'
                                    : 'text-green-400 bg-green-400/10'">
                                {{ p.stock === 0 ? 'Sin stock' : p.stock <= 10 ? 'Stock bajo' : 'Stock OK' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>