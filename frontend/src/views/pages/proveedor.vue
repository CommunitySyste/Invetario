<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import proveedorModal from '../../components/proveedorModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'
import { formatearFecha } from '../../helper/fechaHelper'

const auth = useAuthStore()
const modalVisible = ref(false)
const proveedorSeleccionado = ref(null)
const confirmVisible = ref(false)
const proveedorAEliminar = ref(null)
const proveedores = ref([])
const search = ref('')
const notif = useNotificationStore()
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getProveedores() {
    try {
        const { data } = await api.get('/proveedores');
        proveedores.value = data;
        notif.notify('Proveedores recibidos exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getProveedores();
})

async function crearProveedor(data) {
    try {
        await api.post('/proveedores', data);
        modalVisible.value = false;
        await getProveedores();
        notif.notify('Proveedor creado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el proveedor', 'error');
    }
}

async function abrirEditar(proveedor) {
    proveedorSeleccionado.value = proveedor;
    modalVisible.value = true;
}

async function actualizarProveedor(data) {
    try {
        await api.put(`/proveedores/${data.id}`, data);
        modalVisible.value = false;
        await getProveedores();
        proveedorSeleccionado.value = null;
        notif.notify('Proveedor actualizado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al actualizar el proveedor', 'error');
    }
}

async function eliminarProveedor(proveedor) {
    proveedorAEliminar.value = proveedor;
    confirmVisible.value = true;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/proveedores/${proveedorAEliminar.value.id}`);
        await getProveedores();
        confirmVisible.value = false;
        proveedorAEliminar.value = null;
        notif.notify('Proveedor eliminado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar el proveedor', 'error');
    }
}

const proveedoresFiltrados = computed(() => {
    return proveedores.value.filter(proveedor => {
        const matchNombre = proveedor.nombre.toLowerCase().includes(search.value.toLowerCase());
        const matchTelefono = proveedor.telefono.toLowerCase().includes(search.value.toLowerCase());
        const matchEmail = proveedor.email.toLowerCase().includes(search.value.toLowerCase());
        const matchDireccion = proveedor.direccion.toLowerCase().includes(search.value.toLowerCase());

        return matchNombre || matchTelefono || matchEmail || matchDireccion;
    });
})

const totalPaginas = computed(() => {
    return Math.ceil(proveedoresFiltrados.value.length / itemsPorPagina);
})

const proveedoresPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return proveedoresFiltrados.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 text-white">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-semibold text-slate-100">Proveedores</h1>
            </div>
        <!-- Filtros y acciones -->
        <div class="flex flex-wrap gap-3 mb-6 items-center justify-between">
        
            <div class="flex gap-3 flex-wrap">

                <!-- Buscar -->
                <div class="flex items-center gap-2 bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2">
                    <i data-lucide="search" class="w-4 h-4 text-gray-400"></i>
                    <input v-model="search" type="text" placeholder="Buscar proveedor..."
                        class="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
                </div>

                <!-- Filtro estado -->
                <select 
                    class="bg-[#1e1e2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>

            </div>

            <!-- Botón nuevo -->
            <button @click="modalVisible = true" v-if="puedeCrear('proveedores')"
                class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 transition px-4 py-2 rounded-lg text-sm font-medium">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Nuevo Proveedor
            </button>
        </div>

        <!-- Tarjetas resumen -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Total Proveedores</span>
                    <i data-lucide="users" class="w-4 h-4 text-violet-400"></i>
                </div>
                <p class="text-2xl font-bold text-white">{{ proveedores.length }}</p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Activos</span>
                    <i data-lucide="circle-check" class="w-4 h-4 text-green-400"></i>
                </div>
                <p class="text-2xl font-bold text-green-400">{{proveedores.filter(p => p.estado === 'activo').length}}
                </p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Inactivos</span>
                    <i data-lucide="circle-x" class="w-4 h-4 text-red-400"></i>
                </div>
                <p class="text-2xl font-bold text-red-400">{{proveedores.filter(p => p.estado === 'inactivo').length}}
                </p>
            </div>

            <div class="bg-[#1e1e2e] border border-white/10 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-400 uppercase tracking-wider">Este mes</span>
                    <i data-lucide="calendar-plus" class="w-4 h-4 text-blue-400"></i>
                </div>
                <p class="text-2xl font-bold text-blue-400">3</p>
            </div>

        </div>

        <!-- Tabla -->
        <div class="bg-[#12121f] border border-[#2d2d45] rounded-xl overflow-x-auto">
            <!-- Título tabla -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 class="text-sm font-semibold text-white">Lista de Proveedores</h2>
                <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{{ proveedores.length }} registros</span>
            </div>

            <table class="w-full">
                <thead class="bg-[#1a1a2e]">
                    <tr>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            #</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Nombre</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Empresa</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Teléfono</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Email</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Dirección</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Estado</th>
                        <th class="px-5 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Acciones</th>
                    </tr>
                </thead>
                <tbody>

                    <!-- Fila ejemplo 1 -->
                    <tr v-for="(proveedor, index) in proveedoresPaginados" :key="proveedor.id"
                        class="border-b border-[#1e1e30] hover:bg-[#1a1a2e] transition">
                        <td class="px-5 py-3.5 text-xs text-slate-500">{{  (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-7 h-7 rounded-full bg-violet-700/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                                    {{ proveedor.nombre.slice(0, 2).toUpperCase() }}
                                </div>
                                <span class="text-white font-medium text-sm">{{ proveedor.nombre }}</span>
                            </div>
                        </td>
                        <td class="px-5 py-3.5 text-sm text-slate-300">{{ proveedor.empresa }}</td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="phone" class="w-3 h-3"></i>
                                {{ proveedor.telefono }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="mail" class="w-3 h-3"></i>
                                {{ proveedor.email }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-1 text-xs text-slate-400">
                                <i data-lucide="map-pin" class="w-3 h-3"></i>
                                {{ proveedor.direccion }}
                            </div>
                        </td>
                        <td class="px-5 py-3.5">
                            <span class="flex items-center gap-1 px-2 py-0.5 rounded-full w-fit text-xs font-medium"
                                :class="proveedor.estado === 'activo' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'">
                                <i :data-lucide="proveedor.estado === 'activo' ? 'circle-check' : 'circle-x'"
                                    class="w-3 h-3"></i>
                                {{ proveedor.estado }}
                            </span>
                        </td>
                        <td class="px-5 py-3.5">
                            <div class="flex items-center gap-2">
                                <button @click="abrirEditar(proveedor)" v-if="puedeEditar('proveedores')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-violet-600 hover:text-violet-400 transition">
                                    <i data-lucide="pencil" class="w-3 h-3"></i> Editar
                                </button>
                                <button @click="eliminarProveedor(proveedor)" :disabled="!puedeEliminar('proveedores')"
                                    class="flex items-center gap-1 text-[11px] text-slate-400 border border-[#2d2d45] rounded-md px-2 py-1 hover:border-red-600 hover:text-red-400 transition">
                                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- Sin datos (descomentar si no hay registros) -->
                    <!--
          <tr>
            <td colspan="8" class="px-5 py-16 text-center">
              <div class="flex flex-col items-center gap-3 text-gray-500">
                <i data-lucide="inbox" class="w-10 h-10 opacity-40"></i>
                <p class="text-sm">No hay proveedores registrados</p>
              </div>
            </td>
          </tr>
          -->

                </tbody>
            </table>

            <!-- Footer paginación -->
            <div class="flex items-center justify-between px-5 py-3 border-t border-white/10 text-xs text-gray-500">
                <span>Mostrando {{ proveedoresPaginados.length ? 1 : 0 }} – {{ proveedoresPaginados.length }} de {{ proveedores.length }}</span>
                <div class="flex gap-1">
                    <button class="px-2 py-1 rounded bg-violet-700 text-white" :disabled="paginaActual === 1" @click="paginaActual--"><- Anterior</button>
                    <button class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition" v-for="page in totalPaginas" :key="page" @click="paginaActual = page" :class="{ 'bg-violet-700 text-white': paginaActual === page }">{{ page }}</button>
                    <button class="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente -></button>
                </div>
            </div>

        </div>
        <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este proveedor?"
            @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
        <proveedorModal v-if="modalVisible" :proveedor="proveedorSeleccionado"
            @close="() => { modalVisible = false; proveedorSeleccionado = null }" @save="crearProveedor"
            @update="actualizarProveedor" />
    </div>
</template>
<style scoped></style>