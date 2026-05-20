<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import productosModal from '../../components/productosModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'
import { formatearFecha } from '../../helper/fechaHelper'
import pdfModal from '../../components/pdf/prodctosPdfModal.vue'

const auth = useAuthStore()
const modalVisible = ref(false)
const productos = ref([])
const categoria = ref([])
const notif = useNotificationStore()
const productoSeleccionado = ref(null)
const confirmVisible = ref(false)
const productoAEliminar = ref(null)
const search = ref('')
const categoriaSeleccionada = ref(null)
const productosEstadisticos = ref([])
const pdfUrl = ref(null)
const pdfBlob = ref(null)
const modalPsfVisible = ref(false)
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getCategorias() {
    try {
        const { data } = await api.get('/categorias');
        categoria.value = data;
        notif.notify('Categorias recibidas exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

async function getProductos() {
    try {
        const { data } = await api.get('/productos');
        productos.value = data.map(p => ({
            ...p,
            precio: Number(p.precio),
            stock: Number(p.stock)
        }));
        notif.notify('Productos recibidos exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

async function getProductosEstadisticos() {
    try {
        const { data } = await api.get('/productos/stats');
        productosEstadisticos.value = data;
        notif.notify('Estadísticas recibidas exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getProductos();
    await getCategorias();
    categoriaSeleccionada.value = ''
    await setupLucide();
    await getProductosEstadisticos();
})

async function crearProducto(data) {
    try {
        await api.post('/productos', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        modalVisible.value = false;
        await getProductos();
        notif.notify('Producto creado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el producto', 'error');
    }
}

async function abrirEditar(producto) {
    productoSeleccionado.value = producto;
    modalVisible.value = true;
}

async function actualizarProducto(data) {
    try {
        await api.put(`/productos/${data.get('id')}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        modalVisible.value = false;
        await getProductos();
        productoSeleccionado.value = null;
        notif.notify('Producto actualizado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al actualizar el producto', 'error');
    }
}

async function eliminarProducto(producto) {
    confirmVisible.value = true;
    productoAEliminar.value = producto;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/productos/${productoAEliminar.value.id}`);
        await getProductos();
        confirmVisible.value = false;
        productoAEliminar.value = null;
        notif.notify('Producto eliminado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar el producto', 'error');
    }
}

async function generarPDFProducto() {
    try {
        const res = await api.get('/productos/pdf', {
            responseType: 'blob'
        });
        
        const blob = new Blob([res.data], { type: 'application/pdf' });
        pdfBlob.value = blob;
        pdfUrl.value = URL.createObjectURL(blob);

        modalPsfVisible.value = true;

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
    link.download = `reporte_productos_${fecha}.pdf`;

    link.click();
}

async function generarPDFProductoIndividual(id) {
    try {
        const res = await api.get(`/productos/pdf/${id}`, {
            responseType: 'blob'
        });
        
        const blob = new Blob([res.data], { type: 'application/pdf' });
        pdfBlob.value = blob;
        pdfUrl.value = URL.createObjectURL(blob);
        
        modalPsfVisible.value = true;
    } catch (error) {
        console.error(error);
        notif.notify('Error al generar el pdf', 'error');
    }
}

const productosFiltrados = computed(() => {
    return productos.value.filter(producto => {

        // filtro por nombre
        const coincideNombre = producto.nombre.toLowerCase().includes(search.value.toLowerCase());

        const coincideCategoria = categoriaSeleccionada.value === '' || producto.categoria_id == categoriaSeleccionada.value;

        return coincideNombre && coincideCategoria;
    });
});

const totalPaginas = computed(() => {
    return Math.ceil(productosFiltrados.value.length / itemsPorPagina);
})

const productosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return productosFiltrados.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 min-h-screen bg-[#0d0d14] text-slate-200">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-semibold text-slate-100">Productos</h1>
                <p class="text-xs text-slate-500 mt-0.5">Gestiona el inventario de productos</p>
            </div>
            <button @click="modalVisible = true" v-if="puedeCrear('productos')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Nuevo Producto
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-[#1a1a2e] border border-[#2d2d45] rounded-xl px-5 py-4">
                <p class="text-xs text-slate-500 mb-1">Total productos</p>
                <p class="text-3xl font-semibold text-slate-100"> {{ productosEstadisticos.total }}</p>
                <p class="text-xs text-emerald-400 mt-1"> ↑ {{ productosEstadisticos.total - productos.length }} este mes</p>
            </div>
            <div class="bg-[#1a1a2e] border border-[#2d2d45] rounded-xl px-5 py-4">
                <p class="text-xs text-slate-500 mb-1">Stock bajo</p>
                <p class="text-3xl font-semibold text-red-400">{{ productosEstadisticos.stock_bajo }}</p>
                <p class="text-xs text-slate-500 mt-1">Requieren reposición</p>
            </div>
            <div class="bg-[#1a1a2e] border border-[#2d2d45] rounded-xl px-5 py-4">
                <p class="text-xs text-slate-500 mb-1">Agregados este mes</p>
                <p class="text-3xl font-semibold text-slate-100">{{ productosEstadisticos.mes }}</p>
                <p class="text-xs text-emerald-400 mt-1">↑ vs mes anterior</p>
            </div>
        </div>

        <!-- Filtros -->
        <div class="flex items-center gap-3 mb-5">
            <div class="relative flex-1 max-w-sm">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"></i>
                <input v-model="search" type="text" placeholder="Buscar producto..."
                    class="w-full bg-[#1a1a2e] border border-[#2d2d45] rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-600" />
            </div>
            <div class="relative">
                <i data-lucide="layers" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"></i>
                <select v-model="categoriaSeleccionada" class="bg-[#1a1a2e] border border-[#2d2d45] rounded-lg pl-9 pr-8 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-violet-600 appearance-none">
                    <option value="">Todas las categorías</option>
                    <option v-for="categoria in categoria" :key="categoria.id" :value="categoria.id">{{ categoria.nombre}}</option>
                </select>
            </div>
            <button @click="generarPDFProducto"
                class="flex items-center gap-2 bg-[#1a1a2e] border border-[#2d2d45] rounded-lg px-3 py-2.5 text-slate-400 text-sm">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> PDF
            </button>
        </div>
        <div v-if="!puedeVer('productos')" class="p-6 text-center">
            <p class="text-sm text-gray-500">No tienes acceso a esta vista</p>
        </div>
        <!-- Tabla -->
        <div v-else class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <div class="flex items-center justify-between px-5 py-4 border-b border-[#2d2d45]">
                <span class="text-sm font-medium text-slate-100">Lista de Productos</span>
                <span class="text-xs text-slate-500 bg-[#1e1e30] rounded-full px-3 py-0.5"> registros {{ productosFiltrados.length }}</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Producto</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Categoría</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Precio</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Stock</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Estado</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Creado</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(producto, index) in productosPaginados" :key="producto.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">

                        <td class="px-5 py-3.5 text-xs text-slate-500">{{  (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>

                        <!-- Producto -->
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2.5">
                                <div>
                                    <p class="text-sm font-medium text-slate-100">{{ producto.nombre }}</p>
                                    <p class="text-[11px] text-slate-500">{{ producto.sku }}</p>
                                </div>
                            </div>
                        </td>

                        <!-- Categoría -->
                        <td class="px-5 py-3.5">
                            <span class="text-xs text-slate-300 bg-[#1e1e30] px-2.5 py-1 rounded-md">
                                {{ producto.categoriaNombre }}
                            </span>
                        </td>

                        <!-- Precio -->
                        <td class="px-5 py-3.5 text-sm font-medium text-slate-100">
                            ${{ producto.precio.toFixed(2) }}
                        </td>

                        <!-- Stock -->
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium"
                                    :class="producto.stock <= 5 ? 'text-red-400' : 'text-slate-100'">
                                    {{ producto.stock }}
                                </span>
                                <i v-if="producto.stock <= 5" data-lucide="alert-triangle"
                                    class="w-3.5 h-3.5 text-red-400"></i>
                            </div>
                        </td>

                        <!-- Estado -->
                        <td class="px-5 py-3.5">
                            <span class="text-[11px] font-medium px-2.5 py-1 rounded-full border" :class="{
                                'bg-emerald-950 text-emerald-400 border-emerald-900': producto.estado === 'activo',
                                'bg-stone-900 text-stone-500 border-stone-800': producto.estado === 'inactivo',
                                'bg-yellow-950 text-yellow-500 border-yellow-900': producto.estado === 'borrador'
                            }">
                                ● {{ producto.estado }}
                            </span>
                        </td>

                        <!-- Fecha -->
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatearFecha(producto.created_at) }}</td>

                        <!-- Acciones -->
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button @click="abrirEditar(producto)" v-if="puedeEditar('productos')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="pencil" class="w-3 h-3"></i> Editar
                                </button> 
                                <button @click="generarPDFProductoIndividual(producto.id)" class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-red-500 hover:text-red-400 transition">
                                    <i data-lucide="file-text" class="w-3 h-3"></i> PDF
                                </button>
                                <button @click="eliminarProducto(producto)" :disabled="!puedeEliminar('productos')"
                                    class="text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-red-600 hover:text-red-400 transition">
                                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </td>

                    </tr>
                </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex items-center justify-between px-5 py-3.5 border-t border-[#2d2d45]">
                <span class="text-xs text-slate-500">Mostrando {{ productosPaginados.length ? 1 : 0 }} – {{ productosPaginados.length }} de {{ productosFiltrados.length }}</span>
                <div class="flex gap-1">
                    <button
                        class="text-xs text-white bg-violet-700 border border-violet-700 rounded-md px-2.5 py-1" :disabled="paginaActual === 1" @click="paginaActual--">← Anterior</button>
                        <button
                        class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1" v-for="page in totalPaginas" :key="page" @click="paginaActual = page" :class="{ 'bg-[#1a1a2e] text-slate-600 border-[#2d2d45]': paginaActual === page }">{{ page }}</button>
                    <button
                        class="text-xs text-slate-400 bg-[#1a1a2e] border border-[#2d2d45] rounded-md px-2.5 py-1" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente →</button>
                </div>
            </div>
        </div>
        <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este producto?"
            @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
        <productosModal v-if="modalVisible" :producto="productoSeleccionado"
            @close="() => { modalVisible = false; productoSeleccionado = null }" @save="crearProducto"
            @update="actualizarProducto" />
            <pdfModal v-if="modalPsfVisible" :pdfUrl="pdfUrl" @close="modalPsfVisible = false" @descargar="descargarPDF" />
    </div>
</template>
<style scoped></style>