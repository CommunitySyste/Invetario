<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import { setupLucide } from '../../assets/js/lucide'
import { formatearFecha } from '../../helper/fechaHelper'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const notif = useNotificationStore()
const search  = ref('')
const tipo    = ref('')
const desde   = ref('')
const hasta   = ref('')
const movimientos   = ref([])
const porTipo       = ref([])
const porDia        = ref([])
const topProductos  = ref([])


let chartDonut   = null
let chartLinea   = null
let chartBarras  = null

async function cargar() {
    try {
        const params = {}
        if (tipo.value)  params.tipo  = tipo.value
        if (desde.value) params.desde = desde.value
        if (hasta.value) params.hasta = hasta.value

        const { data } = await api.get('/movimientos/estadisticas', { params })

        movimientos.value  = data.movimientos
        porTipo.value      = data.porTipo
        porDia.value       = data.porDia
        topProductos.value = data.topProductos
        notif.notify('Estadísticas recibidas exitosamente', 'success')

        await nextTick()
        setupLucide()
        renderCharts()
    } catch (error) {
        notif.notify('Error al cargar estadísticas', 'error')
    }
}

function renderCharts() {

    const entrada = porTipo.value.find(p => p.tipo === 'entrada')?.total || 0
    const salida  = porTipo.value.find(p => p.tipo === 'salida')?.total  || 0

    if (chartDonut) chartDonut.destroy()
    const ctxDonut = document.getElementById('chartDonut')
    if (ctxDonut) {
        chartDonut = new Chart(ctxDonut, {
            type: 'doughnut',
            data: {
                labels: ['Entradas', 'Salidas'],
                datasets: [{
                    data: [entrada, salida],
                    backgroundColor: ['#43a047', '#e53935'],
                    borderColor: '#43a047',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#c4b8e8', font: { size: 12 } }
                }
            },
                cutout: '70%'
            }
        })
    }

    const dias      = [...new Set(porDia.value.map(d => d.dia))]
    const entradas  = dias.map(d => porDia.value.find(p => p.dia === d && p.tipo === 'entrada')?.total || 0)
    const salidas   = dias.map(d => porDia.value.find(p => p.dia === d && p.tipo === 'salida')?.total  || 0)

    if (chartLinea) chartLinea.destroy()
    const ctxLinea = document.getElementById('chartLinea')
    if (ctxLinea) {
        chartLinea = new Chart(ctxLinea, {
            type: 'line',
            data: {
                labels: dias,
                datasets: [
                    {
                        label: 'Entradas',
                        data: entradas,
                        borderColor: '#43a047',
                        backgroundColor: 'rgba(67,160,71,0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Salidas',
                        data: salidas,
                        borderColor: '#e53935',
                        backgroundColor: 'rgba(229,57,53,0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: {
                    x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
                    y: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } }
                }
            }
        })
    }
    const nombresTop = [...new Set(topProductos.value.map(p => p.nombre))]
    const entradasTop = nombresTop.map(n => topProductos.value.find(p => p.nombre === n && p.tipo === 'entrada')?.total || 0)
    const salidasTop  = nombresTop.map(n => topProductos.value.find(p => p.nombre === n && p.tipo === 'salida')?.total  || 0)

    if (chartBarras) chartBarras.destroy()
    const ctxBarras = document.getElementById('chartBarras')
    if (ctxBarras) {
        chartBarras = new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: nombresTop,
                datasets: [
                    {
                        label: 'Entradas',
                        data: entradasTop,
                        backgroundColor: 'rgba(67,160,71,0.7)',
                        borderRadius: 6
                    },
                    {
                        label: 'Salidas',
                        data: salidasTop,
                        backgroundColor: 'rgba(229,57,53,0.7)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9ca3af' } } },
                scales: {
                    x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
                    y: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } }
                }
            }
        })
    }
}

const movimientosFiltrados = computed(() => {
    return movimientos.value.filter(m => {
        const matchSearch = search.value.trim()
            ? m.producto.toLowerCase().includes(search.value.toLowerCase()) ||
              m.usuario.toLowerCase().includes(search.value.toLowerCase())
            : true
        return matchSearch
    })
})

watch([tipo, desde, hasta], () => cargar())

onMounted(() => cargar())
</script>

<template>
    <div class="p-6 text-white flex flex-col gap-6">

        <!-- Filtros -->
        <div class="flex flex-wrap gap-3 items-center">
            <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                <input v-model="search" type="text" placeholder="Buscar producto o usuario..."
                    class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-52" />
            </div>

            <select v-model="tipo"
                class="bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                <option value="">Todos los tipos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
            </select>

            <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                <i data-lucide="calendar" class="w-4 h-4 text-gray-400"></i>
                <input v-model="desde" type="date" class="bg-transparent text-sm text-gray-300 outline-none" />
            </div>

            <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                <i data-lucide="calendar" class="w-4 h-4 text-gray-400"></i>
                <input v-model="hasta" type="date" class="bg-transparent text-sm text-gray-300 outline-none" />
            </div>

            <button @click="cargar"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 transition px-4 py-2 rounded-lg text-sm font-medium">
                <i data-lucide="filter" class="w-4 h-4"></i>
                Filtrar
            </button>
        </div>

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Movimientos</span>
                    <i data-lucide="activity" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{ movimientos.length }}</p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Entradas</span>
                    <i data-lucide="trending-up" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">
                    {{ movimientos.filter(m => m.tipo === 'entrada').length }}
                </p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Salidas</span>
                    <i data-lucide="trending-down" class="w-4 h-4 text-red-400"></i>
                </div>
                <p class="text-2xl font-bold text-red-400">
                    {{ movimientos.filter(m => m.tipo === 'salida').length }}
                </p>
            </div>
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Productos Únicos</span>
                    <i data-lucide="package" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">
                    {{ new Set(movimientos.map(m => m.producto)).size }}
                </p>
            </div>
        </div>

        <!-- Gráficas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Donut -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5">
                <h3 class="text-sm font-semibold text-white mb-4">Entradas vs Salidas</h3>
                <div class="flex items-center justify-center" style="height: 200px;">
                    <canvas id="chartDonut"></canvas>
                </div>
            </div>

            <!-- Barras top productos -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5 md:col-span-2">
                <h3 class="text-sm font-semibold text-white mb-4">Top 5 Productos con más movimientos</h3>
                <div style="height: 200px;">
                    <canvas id="chartBarras"></canvas>
                </div>
            </div>

        </div>

        <!-- Línea temporal -->
        <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5">
            <h3 class="text-sm font-semibold text-white mb-4">Movimientos por día</h3>
            <div style="height: 220px;">
                <canvas id="chartLinea"></canvas>
            </div>
        </div>

        <!-- Tabla -->
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 class="text-sm font-semibold text-white">Detalle de Movimientos</h2>
                <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                    {{ movimientosFiltrados.length }} registros
                </span>
            </div>
            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cantidad</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Usuario</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="movimientosFiltrados.length === 0">
                        <td colspan="6" class="px-5 py-16 text-center">
                            <div class="flex flex-col items-center gap-3 text-gray-500">
                                <i data-lucide="inbox" class="w-10 h-10 opacity-40"></i>
                                <p class="text-sm">No hay movimientos</p>
                            </div>
                        </td>
                    </tr>
                    <tr v-for="(m, i) in movimientosFiltrados" :key="m.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-sm text-white font-medium">{{ m.productoNombre }}</td>
                        <td class="px-5 py-3.5">
                            <span class="flex items-center gap-1 px-2 py-0.5 rounded-full w-fit text-xs font-medium"
                                :class="m.tipo === 'entrada'
                                    ? 'text-green-400 bg-green-400/10'
                                    : 'text-red-400 bg-red-400/10'">
                                <i v-if="m.tipo === 'entrada'" data-lucide="arrow-down-circle" class="w-3 h-3"></i>
                                <i v-else data-lucide="arrow-up-circle" class="w-3 h-3"></i>
                                {{ m.tipo }}
                            </span>
                        </td>
                        <td class="px-5 py-3.5 text-sm font-semibold"
                            :class="m.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'">
                            {{ m.tipo === 'entrada' ? '+' : '-' }}{{ m.cantidad }}
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-400">{{ m.usuarioNombre }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                {{ formatearFecha(m.fecha) }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-400">{{ m.motivo }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>