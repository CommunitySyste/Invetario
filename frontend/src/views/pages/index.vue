<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import { setupLucide } from '../../assets/js/lucide'
import { formatearFecha } from '../../helper/fechaHelper'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const notif = useNotificationStore()

const resumen       = ref({})
const ventasPorMes  = ref([])
const comprasPorMes = ref([])
const topProductos  = ref([])
const ultimasVentas  = ref([])
const ultimasCompras = ref([])

let chartLinea  = null
let chartBarras = null

async function cargar() {
    try {
        const { data } = await api.get('/index')
        resumen.value       = data.resumen
        ventasPorMes.value  = data.ventasPorMes
        comprasPorMes.value = data.comprasPorMes
        topProductos.value  = data.topProductos
        ultimasVentas.value  = data.ultimasVentas
        ultimasCompras.value = data.ultimasCompras
        await nextTick()
        setupLucide()
        renderCharts()
    } catch (error) {
        notif.notify('Error al cargar el dashboard', 'error')
    }
}

function renderCharts() {

    const meses = [...new Set([
        ...ventasPorMes.value.map(v => v.mes),
        ...comprasPorMes.value.map(c => c.mes)
    ])].sort()

    const datosVentas  = meses.map(m => ventasPorMes.value.find(v => v.mes === m)?.total || 0)
    const datosCompras = meses.map(m => comprasPorMes.value.find(c => c.mes === m)?.total || 0)

    if (chartLinea) chartLinea.destroy()
    const ctxLinea = document.getElementById('chartLinea')
    if (ctxLinea) {
        chartLinea = new Chart(ctxLinea, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Ventas',
                        data: datosVentas,
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124,58,237,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#7c3aed'
                    },
                    {
                        label: 'Compras',
                        data: datosCompras,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6'
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

    if (chartBarras) chartBarras.destroy()
    const ctxBarras = document.getElementById('chartBarras')
    if (ctxBarras) {
        chartBarras = new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: topProductos.value.map(p => p.nombre),
                datasets: [{
                    label: 'Unidades vendidas',
                    data: topProductos.value.map(p => p.total_vendido),
                    backgroundColor: 'rgba(124,58,237,0.7)',
                    borderRadius: 6
                }]
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

onMounted(() => cargar())
</script>

<template>
    <div class="p-6 text-white flex flex-col gap-6">

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Ventas</span>
                    <div class="w-8 h-8 rounded-lg bg-violet-700/20 flex items-center justify-center">
                        <i data-lucide="trending-up" class="w-4 h-4 text-violet-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-white">${{ Number(resumen.ventas?.total_vendido || 0).toFixed(2) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ resumen.ventas?.total_ventas || 0 }} ventas registradas</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Compras</span>
                    <div class="w-8 h-8 rounded-lg bg-blue-700/20 flex items-center justify-center">
                        <i data-lucide="shopping-cart" class="w-4 h-4 text-blue-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-white">${{ Number(resumen.compras?.total_comprado || 0).toFixed(2) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ resumen.compras?.total_compras || 0 }} compras registradas</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Productos</span>
                    <div class="w-8 h-8 rounded-lg bg-green-700/20 flex items-center justify-center">
                        <i data-lucide="package" class="w-4 h-4 text-green-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-white">{{ resumen.productos?.total_productos || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ resumen.productos?.total_stock || 0 }} unidades en stock</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Stock Bajo</span>
                    <div class="w-8 h-8 rounded-lg bg-orange-700/20 flex items-center justify-center">
                        <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-orange-400">{{ resumen.productos?.stock_bajo || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ resumen.productos?.sin_stock || 0 }} sin stock</p>
            </div>

        </div>

        <!-- Gráficas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <!-- Línea ventas vs compras -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5 md:col-span-2">
                <h3 class="text-sm font-semibold text-white mb-4">Ventas vs Compras — últimos 6 meses</h3>
                <div style="height: 240px;">
                    <canvas id="chartLinea"></canvas>
                </div>
            </div>

            <!-- Stats ventas -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                <h3 class="text-sm font-semibold text-white">Estado de Ventas</h3>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-green-400"></div>
                            <span class="text-xs text-gray-400">Completadas</span>
                        </div>
                        <span class="text-sm font-bold text-green-400">{{ resumen.ventas?.ventas_completadas || 0 }}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1.5">
                        <div class="bg-green-400 h-1.5 rounded-full transition-all"
                            :style="`width: ${resumen.ventas?.total_ventas ? (resumen.ventas.ventas_completadas / resumen.ventas.total_ventas * 100) : 0}%`">
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span class="text-xs text-gray-400">Pendientes</span>
                        </div>
                        <span class="text-sm font-bold text-yellow-400">{{ resumen.ventas?.ventas_pendientes || 0 }}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1.5">
                        <div class="bg-yellow-400 h-1.5 rounded-full transition-all"
                            :style="`width: ${resumen.ventas?.total_ventas ? (resumen.ventas.ventas_pendientes / resumen.ventas.total_ventas * 100) : 0}%`">
                        </div>
                    </div>
                </div>

                <div class="border-t border-white/10 pt-3">
                    <h3 class="text-sm font-semibold text-white mb-3">Estado de Compras</h3>
                    <div class="flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span class="text-xs text-gray-400">Completadas</span>
                            </div>
                            <span class="text-sm font-bold text-blue-400">{{ resumen.compras?.compras_completadas || 0 }}</span>
                        </div>
                        <div class="w-full bg-white/5 rounded-full h-1.5">
                            <div class="bg-blue-400 h-1.5 rounded-full transition-all"
                                :style="`width: ${resumen.compras?.total_compras ? (resumen.compras.compras_completadas / resumen.compras.total_compras * 100) : 0}%`">
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span class="text-xs text-gray-400">Pendientes</span>
                            </div>
                            <span class="text-sm font-bold text-yellow-400">{{ resumen.compras?.compras_pendientes || 0 }}</span>
                        </div>
                        <div class="w-full bg-white/5 rounded-full h-1.5">
                            <div class="bg-yellow-400 h-1.5 rounded-full transition-all"
                                :style="`width: ${resumen.compras?.total_compras ? (resumen.compras.compras_pendientes / resumen.compras.total_compras * 100) : 0}%`">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Barras top productos -->
        <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-5">
            <h3 class="text-sm font-semibold text-white mb-4">Top 5 Productos más vendidos</h3>
            <div style="height: 220px;">
                <canvas id="chartBarras"></canvas>
            </div>
        </div>

        <!-- Últimas ventas y compras -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Últimas ventas -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 class="text-sm font-semibold text-white">Últimas Ventas</h3>
                    <i data-lucide="trending-up" class="w-4 h-4 text-violet-400"></i>
                </div>
                <div class="divide-y divide-white/5">
                    <div v-if="ultimasVentas.length === 0" class="px-5 py-8 text-center text-xs text-gray-500">
                        Sin ventas registradas
                    </div>
                    <div v-for="v in ultimasVentas" :key="v.id"
                        class="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-violet-700/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                                {{ v.usuario?.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <p class="text-sm text-white font-medium">{{ v.usuario }}</p>
                                <p class="text-[11px] text-gray-500">{{ formatearFecha(v.fecha) }}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="text-sm font-bold text-white">${{ Number(v.total).toFixed(2) }}</span>
                            <span class="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                                :class="{
                                    'text-green-400 bg-green-400/10': v.estado === 'completado',
                                    'text-yellow-400 bg-yellow-400/10': v.estado === 'pendiente',
                                    'text-red-400 bg-red-400/10': v.estado === 'cancelado'
                                }">
                                {{ v.estado }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Últimas compras -->
            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 class="text-sm font-semibold text-white">Últimas Compras</h3>
                    <i data-lucide="shopping-cart" class="w-4 h-4 text-blue-400"></i>
                </div>
                <div class="divide-y divide-white/5">
                    <div v-if="ultimasCompras.length === 0" class="px-5 py-8 text-center text-xs text-gray-500">
                        Sin compras registradas
                    </div>
                    <div v-for="c in ultimasCompras" :key="c.id"
                        class="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-700/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                                {{ c.empresa?.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <p class="text-sm text-white font-medium">{{ c.proveedor }}</p>
                                <p class="text-[11px] text-gray-500">{{ c.empresa }} — {{ formatearFecha(c.fecha) }}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="text-sm font-bold text-white">${{ Number(c.total).toFixed(2) }}</span>
                            <span class="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                                :class="{
                                    'text-green-400 bg-green-400/10': c.estado === 'completado',
                                    'text-yellow-400 bg-yellow-400/10': c.estado === 'pendiente',
                                    'text-red-400 bg-red-400/10': c.estado === 'cancelado'
                                }">
                                {{ c.estado }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>