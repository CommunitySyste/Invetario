<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import CategoriaModal from '../../components/categoriaModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'
import { formatearFecha } from '@/helper/fechaHelper'

const notif = useNotificationStore()
const modalVisible = ref(false)
const categorias = ref([])
const categoriaSeleccionado = ref(null)
const confirmVisible = ref(false)
const categoriaAEliminar = ref(null)
const search = ref('')
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getCategorias() {
    try {
        const { data } = await api.get('/categorias');
        categorias.value = data;
        notif.notify('Categorías recibidas exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getCategorias();
})

async function crearCategoria(data) {
    try {
        await api.post('/categorias', data);
        modalVisible.value = false;
        await getCategorias();
        notif.notify('Categoría creada exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear la categoría', 'error');
    }
}

async function abrirEditar(categoria) {
    categoriaSeleccionado.value = categoria;
    modalVisible.value = true;
}

async function actualizarCategoria(data) {
    try {
        await api.put(`/categorias/${data.id}`, data);
        modalVisible.value = false;
        await getCategorias();
        categoriaSeleccionado.value = null;
        notif.notify('Categoría actualizada exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al actualizar la categoría', 'error');
    }
}

async function eliminarCategoria(categoria) {
    categoriaAEliminar.value = categoria;
    confirmVisible.value = true;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/categorias/${categoriaAEliminar.value.id}`);
        await getCategorias();
        confirmVisible.value = false;
        categoriaAEliminar.value = null;
        notif.notify('Categoría eliminada exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar la categoría', 'error');
    }
}

const categoriasFiltrados = computed(() => {
    if (!search.value) return categorias.value;

    return categorias.value.filter(categoria => categoria.nombre.toLowerCase().includes(search.value.toLowerCase()));
})

watch(categorias, async () => {
    await nextTick()
    setupLucide()
}, { immediate: true })

const categoriasMes = computed(() => {
    const hoy = new Date();
    return categorias.value.filter(cat => {
        const fecha = new Date(cat.created_at);
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;
})

const totalPaginas = computed(() => {
    return Math.ceil(categorias.value.length / itemsPorPagina);
})

const categoriasPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return categorias.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 min-h-screen bg-[#0d0d14] text-slate-200">

        <!-- Top bar -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-semibold text-slate-100">Categorías</h1>
                <p class="text-xs text-slate-500 mt-0.5">Gestiona las categorías de tus productos</p>
            </div>
            <button @click="modalVisible = true" v-if="puedeCrear('categorias')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Nueva Categoría
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-[#1a1a2e] border border-[#2d2d45] rounded-xl px-5 py-4">
                <p class="text-xs text-slate-500 mb-1">Total categorías</p>
                <p class="text-3xl font-semibold text-slate-100">{{ categorias.length }}</p>
                <p class="text-xs text-emerald-400 mt-1">↑ {{ categoriasMes }} este mes</p>
            </div>
            <div class="bg-[#1a1a2e] border border-[#2d2d45] rounded-xl px-5 py-4">
                <p class="text-xs text-slate-500 mb-1">Productos vinculados</p>
                <p class="text-3xl font-semibold text-slate-100">{{ categorias.length - categoriasMes }}</p>
                <p class="text-xs text-emerald-400 mt-1">↑ {{ categorias.length - categoriasMes }} nuevos</p>
            </div>
        </div>

        <!-- Búsqueda -->
        <div class="flex items-center gap-3 mb-5">
            <div class="relative flex-1 max-w-sm">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"></i>
                <input v-model="search" type="text" placeholder="Buscar categoría..."
                    class="w-full bg-[#1a1a2e] border border-[#2d2d45] rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-600" />
            </div>
        </div>
        <div v-if="!puedeVer('categorias')" class="p-6 text-center">
            <p class="text-sm text-gray-500">No tienes acceso a esta vista</p>
        </div>
        <!-- Tabla -->
        <div v-else class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <div class="flex items-center justify-between px-5 py-4 border-b border-[#2d2d45]">
                <span class="text-sm font-medium text-slate-100">Lista de Categorías</span>
                <span class="text-xs text-slate-500 bg-[#1e1e30] rounded-full px-3 py-0.5">{{ categorias.length }}
                    registros</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Categoría</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Descripción</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Productos</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Color</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Creado</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Fila 1 -->
                    <tr v-for="(categoria, index) in categoriasPaginados" :key="categoria.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ (paginaActual - 1) * itemsPorPagina + index +
                            1}}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                                    :style="{ background: categoria.color + '20' }">
                                    <i :data-lucide="categoria.icono" class="w-4 h-4"
                                        :style="{ color: categoria.color }"></i>
                                </div>
                                <p class="text-sm font-medium text-slate-100">{{ categoria.nombre }}</p>
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-500 max-w-[180px] truncate">{{ categoria.descripcion
                            }}
                        </td>
                        <td class="px-5 py-3.5 text-sm font-medium text-violet-400">{{ categoria.total_productos }}</td>
                        <td class="px-5 py-3.5">
                            <div class="w-6 h-6 rounded-md border border-white/10"
                                :style="{ background: categoria.color }">
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{ formatearFecha(categoria.created_at) }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button @click="abrirEditar(categoria)" v-if="puedeEditar('categorias')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="pencil" class="w-3 h-3"></i> Editar
                                </button>
                                <button @click="eliminarCategoria(categoria)" :disabled="!puedeEliminar('categorias')"
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
                <span class="text-xs text-slate-500">Mostrando 1–{{ categorias.length }} de {{ categorias.length }}
                    registros</span>
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
            <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar esta categoría?"
                @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
            <CategoriaModal v-if="modalVisible" :categoria="categoriaSeleccionado"
                @close="() => { modalVisible = false; categoriaSeleccionado = null }" @save="crearCategoria"
                @update="actualizarCategoria" />
        </div>
    </div>
</template>
<style scoped></style>