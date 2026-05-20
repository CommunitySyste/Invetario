<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import '../../assets/css/reportes.css'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import { setupLucide } from '../../assets/js/lucide'
import { formatearFecha } from '../../helper/fechaHelper'
import { Chart, registerables } from 'chart.js'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import productosExcel from '@/components/excel/productosExcel.vue'
Chart.register(...registerables)

const notif = useNotificationStore()
const stats = ref([])
const meses = ref([])
const categorias = ref([])
const stocks = ref([])
const productos = ref([])
const canvasDona = ref(null)
const canvasLinea = ref(null)
const canvasBarras = ref(null)
const stockBajos = ref([])
const showModal = ref(false)

let chartDona = null
let chartLinea = null
let chartBarras = null

function buildDona() {
    if (!canvasDona.value) return
    const existing = Chart.getChart(canvasDona.value)
    if (existing) existing.destroy()
    chartDona = new Chart(canvasDona.value, {
        type: 'doughnut',
        data: {
            labels: categorias.value.map(c => c.nombre),
            datasets: [{
                data: categorias.value.map(c => c.total),
                backgroundColor: categorias.value.map(c => c.color + 'cc'),
                borderColor: categorias.value.map(c => c.color),
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
            }
        }
    })
}

function buildLine() {
    if (chartLinea) chartLinea.destroy()
    chartLinea = new Chart(canvasLinea.value, {
        type: 'line',
        data: {
            labels: meses.value.map(m => m.mes),
            datasets: [{
                label: 'Productos',
                data: meses.value.map(m => m.total),
                borderColor: '#7c5cbf',
                backgroundColor: 'rgba(255,255,255,0.1)',
                fill: true,
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#b899f5',
                pointRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#c4b8e8' } } },
            scales: {
                x: { ticks: { color: '#c4b8e8' }, grid: { color: '#1f2937' } },
                y: { ticks: { color: '#c4b8e8' }, grid: { color: '#1f2937' } }
            }
        }
    })
}

function buildBarras() {
    if (!canvasBarras.value) return
    const existing = Chart.getChart(canvasBarras.value)
    if (existing) existing.destroy()
    chartBarras = new Chart(canvasBarras.value, {
        type: 'bar',
        data: {
            labels: stocks.value.map(s => s.nombre),
            datasets: [{
                label: 'Stock',
                data: stocks.value.map(s => s.stock),
                backgroundColor: stocks.value.map(s => s.color + 'cc'),
                borderColor: stocks.value.map(s => s.color),
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#c4b8e8' } }
            },
            scales: {
                x: { ticks: { color: '#55526a' }, grid: { color: '#1e1e2a' } },
                y: { ticks: { color: '#55526a' }, grid: { color: '#1e1e2a' } }
            }
        }
    })
}

async function cargar() {
    try {
        const { data } = await api.get('/reportes/productos')
        stats.value = data
        await nextTick()
        setupLucide()
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }
}

async function mes() {
    try {
        const { data } = await api.get('/reportes/productos/mes')
        meses.value = data
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }
}

async function categoria() {
    try {
        const { data } = await api.get('/reportes/productos/categoria')
        categorias.value = data
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }
}

async function stock() {
    try {
        const { data } = await api.get('/reportes/productos/stock')
        stocks.value = data
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }
}

async function getproductos() {
    try {
        const { data } = await api.get('/categorias')
        productos.value = data
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }

}

async function stockBajo() {
    try {
        const { data } = await api.get('/reportes/productos/stock_bajo')
        stockBajos.value = data
        notif.notify('Reporte cargado exitosamente', 'success')
    } catch (error) {
        notif.notify('Error al cargar reportes', 'error')
    }
}

function abrirModal(){
    showModal.value = true
}

function descargar() {
    const wsStats = XLSX.utils.json_to_sheet([{
        'Total Productos': stats.value.total,
        'Stock Bajo':      stats.value.stock_bajo,
        'Nuevos este Mes': stats.value.mes,
    }])

    const wsStockBajo = XLSX.utils.json_to_sheet(
        stockBajos.value.map(p => ({
            'Producto':  p.nombre,
            'Categoría': p.categoriaNombre,
            'Proveedor': p.proveedorNombre,
            'Stock':     p.stock,
            'Precio':    p.precio,
            'Estado':    p.stock === 0 ? 'Agotado' : 'Bajo',
        }))
    )

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsStats,     'Resumen')
    XLSX.utils.book_append_sheet(wb, wsStockBajo, 'Stock Bajo')

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob  = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, 'reporte_productos.xlsx')
    showModal.value = false
}

onMounted(async () => {
    await cargar(),
        await mes(),
        await categoria(),
        await stock(),
        await getproductos(),
        await stockBajo(),
        buildDona()
    buildBarras()
    buildLine()
})
</script>
<template>
    <div class="p-6 flex flex-col gap-6">

        <!-- ── Cabecera ── -->
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h1 class="page-title text-2xl font-semibold">Reporte de Productos</h1>
                <p class="page-sub text-sm mt-1">Resumen general del inventario</p>
            </div>
            <button @click="abrirModal" class="btn-export flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border">
                <i data-lucide="download" class="w-4 h-4"></i>
                Exportar
            </button>
        </div>

        <!-- ── Stats cards ── -->
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px,1fr));">

            <div class="stat-card stat-purple rounded-xl border p-5 flex items-center gap-4">
                <div
                    class="stat-icon stat-icon-purple flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0">
                    <i data-lucide="package" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="stat-label text-xs mb-1">Total Productos</p>
                    <p class="stat-value text-2xl font-semibold">{{ stats.total }}</p>
                </div>
            </div>

            <div class="stat-card stat-amber rounded-xl border p-5 flex items-center gap-4">
                <div
                    class="stat-icon stat-icon-amber flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0">
                    <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="stat-label text-xs mb-1">Stock Bajo</p>
                    <p class="stat-value text-2xl font-semibold">{{ stats.stock_bajo }}</p>
                </div>
            </div>

            <div class="stat-card stat-green rounded-xl border p-5 flex items-center gap-4">
                <div
                    class="stat-icon stat-icon-green flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0">
                    <i data-lucide="calendar" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="stat-label text-xs mb-1">Nuevos este mes</p>
                    <p class="stat-value text-2xl font-semibold">{{ stats.mes }}</p>
                </div>
            </div>

            <div class="stat-card stat-sky rounded-xl border p-5 flex items-center gap-4">
                <div
                    class="stat-icon stat-icon-sky flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0">
                    <i data-lucide="layers" class="w-5 h-5"></i>
                </div>
                <div>
                    <p class="stat-label text-xs mb-1">Categorías</p>
                    <p class="stat-value text-2xl font-semibold">{{ productos.length }}</p>
                </div>
            </div>

        </div>

        <!-- ── Grid gráficas ── -->
        <div class="grid gap-4" style="grid-template-columns: 1fr 1fr;">

            <!-- Gráfica por categoría (placeholder) -->
            <div class="card rounded-xl border p-5 flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-4 h-4 icon-muted"></i>
                    <h2 class="card-title text-sm font-medium">Productos por Categoría</h2>
                </div>
                <!-- Canvas chart.js irá aquí -->
                <div style="height:200px; position:relative;">
                    <canvas ref="canvasDona"></canvas>
                </div>
            </div>

            <!-- Gráfica por mes (placeholder) -->
            <div class="card rounded-xl border p-5 flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="trending-up" class="w-4 h-4 icon-muted"></i>
                    <h2 class="card-title text-sm font-medium">Productos por Mes</h2>
                </div>
                <!-- Canvas chart.js irá aquí -->
                <div style="height:200px; position:relative;">
                    <canvas ref="canvasLinea"></canvas>
                </div>
            </div>

        </div>

        <!-- ── Gráfica stock top 10 ── -->
        <div class="card rounded-xl border p-5 flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <i data-lucide="bar-chart-2" class="w-4 h-4 icon-muted"></i>
                <h2 class="card-title text-sm font-medium">Top 10 Productos por Stock</h2>
            </div>
            <!-- Canvas chart.js irá aquí -->
            <div style="height:240px; position:relative;">
                <canvas ref="canvasBarras"></canvas>
            </div>
        </div>

        <!-- ── Tabla stock bajo ── -->
        <div class="card rounded-xl border overflow-x-auto">

            <div class="table-header px-5 py-3 flex items-center gap-2 border-b">
                <i data-lucide="alert-triangle" class="w-4 h-4" style="color:#fbbf24;"></i>
                <h2 class="card-title text-sm font-medium">Productos con Stock Bajo</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Producto</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Categoría</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Proveedor</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Stock</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Precio</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Estado</th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr v-for="(bajo, index) in stock_bajo" :key="bajo.id" class="table-row">
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center gap-2">
                                    <span class="prod-name">{{ bajo.nombre }}</span>
                                </div>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <span class="cat-badge px-2 py-1 rounded-md text-xs border">{{ bajo.categoriaNombre
                                }}</span>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b desc-cell">{{ bajo.proveedorNombre }}</td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <span class="stock-low font-semibold">{{ bajo.stock }}</span>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b price-cell">${{ bajo.precio }}</td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <span
                                    class="estado-badge flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit"
                                    :class="p.stock === 0 ? 'estado-out' : 'estado-low'">
                                    <span class="estado-dot"></span>
                                    {{ p.stock === 0 ? 'agotado' : 'bajo' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <productosExcel v-if="showModal" @close="showModal = false" @descargar="descargar">
    <template #preview>
        <table class="w-full border-collapse">
            <thead>
                <tr>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Producto</th>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Categoría</th>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Proveedor</th>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Stock</th>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Precio</th>
                    <th class="th text-left px-4 py-2 text-xs uppercase border-b">Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(p, i) in stockBajos" :key="i" class="table-row">
                    <td class="td px-4 py-2 text-sm border-b prod-name">{{ p.nombre }}</td>
                    <td class="td px-4 py-2 text-sm border-b">
                        <span class="cat-badge px-2 py-1 rounded-md text-xs border">{{ p.categoriaNombre }}</span>
                    </td>
                    <td class="td px-4 py-2 text-sm border-b desc-cell">{{ p.proveedorNombre }}</td>
                    <td class="td px-4 py-2 text-sm border-b">
                        <span :class="p.stock === 0 ? 'stock-out' : 'stock-low'" class="font-semibold">{{ p.stock }}</span>
                    </td>
                    <td class="td px-4 py-2 text-sm border-b price-cell">${{ p.precio }}</td>
                    <td class="td px-4 py-2 text-sm border-b">
                        <span class="estado-badge flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit"
                            :class="p.stock === 0 ? 'estado-out' : 'estado-low'">
                            <span class="estado-dot"></span>
                            {{ p.stock === 0 ? 'Agotado' : 'Bajo' }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </template>
</productosExcel>
</template>

<style scoped></style>