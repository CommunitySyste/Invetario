<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import '../../assets/css/roles.css'
import rolModal from '../../components/rolModal.vue'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import confirModal from '../../components/confirModal.vue'
import { setupLucide } from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'

const auth = useAuthStore()
const modalVisible = ref(false)
const roles = ref([])
const notif = useNotificationStore()
const rolSeleccionado = ref(null)
const confirmVisible = ref(false)
const rolAEliminar = ref(null)
const search = ref('')
const paginaActual = ref(1)
const itemsPorPagina = ref(10)

async function getRols() {
    try {
        const { data } = await api.get('/roles');
        roles.value = data;
        notif.notify('Roles recibidos exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify(error.response.data.message, 'error');
    }
}

onMounted(async () => {
    await getRols();
    await setupLucide()
})

async function crearRol(data){
    try{
        await api.post('/roles', data);
        modalVisible.value = false;
        await getRols();
        notif.notify('Rol creado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el rol', 'error');
    }
}

function editarRol(rol){
    rolSeleccionado.value = rol;
    modalVisible.value = true;
}

async function actualizarRol(data){
    try{
        await api.put(`/roles/${data.id}`, data);
        modalVisible.value = false;
        await getRols();
        rolSeleccionado.value = null;
        notif.notify('Rol actualizado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al actualizar el rol', 'error');
    }
}

function eliminarRol(rol){
    rolAEliminar.value = rol;
    confirmVisible.value = true;
}

async function confirmarEliminar(){
    try {
        await api.delete(`/roles/${rolAEliminar.value.id}`);
        await getRols();
        confirmVisible.value = false;
        rolAEliminar.value = null;
        notif.notify('Rol eliminado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al eliminar el rol', 'error');
    }
}

const rolesFiltrados = computed(() => {
    if (!search.value) return roles.value;

    return roles.value.filter(rol =>
        rol.nombre.toLowerCase().includes(search.value.toLowerCase())
    );
})

const totalPaginas = computed(() => {
    return Math.ceil(rolesFiltrados.value.length / itemsPorPagina.value);
})

const rolesPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
    const fin = inicio + itemsPorPagina.value;

    return rolesFiltrados.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 flex flex-col gap-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <p class="page-sub text-sm mt-1">Gestión de roles del sistema</p>
            </div>
            <button class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                @click="modalVisible = true" v-if="puedeCrear('roles')">
                <i data-lucide="plus" class="btn-icon w-5 h-5"></i> Nuevo Rol
            </button>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
            <div class="search-wrap flex items-center gap-2 px-3 py-2 rounded-xl border flex-1"
                style="max-width:320px;">
                <i data-lucide="search" class="search-icon w-5 h-5 text-gray-400"></i>
                <input v-model="search" type="text" placeholder="Buscar rol..."
                    class="bg-transparent outline-none text-sm w-full search-input" />
            </div>
            <div class="flex items-center gap-2 px-3 py-2 rounded-xl border search-wrap text-sm" style="color:#9490b0;">
                <i data-lucide="filter" class="search-icon w-5 h-5 text-gray-400"></i>
                Filtrar
            </div>
        </div>

        <!-- ── Tabla ── -->
        <div class="card rounded-xl border overflow-x-auto">

            <!-- Header tabla -->
            <div class="table-header px-5 py-3 flex items-center justify-between border-b">
                <span class="text-xs font-medium uppercase tracking-widest" style="color:#55526a;">
                    Total: {{ rolesFiltrados.length }} roles
                </span>
                <span class="text-xs" style="color:#3e3c52;">Mostrando 1 – {{ rolesFiltrados.length }} de {{ roles.length }}</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">#</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Nombre</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Color</th>
                            <th class="th text-center px-5 py-3 text-xs uppercase tracking-widest border-b">Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Fila 1 -->
                        <tr v-for="(rol, index) in rolesPaginados" :key="rol.id" class="table-row">
                            <td class="td px-5 py-3 text-sm border-b" style="color:#55526a;">{{  (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center gap-2">
                                    <span class="role-dot" :style="{ background: rol.color }"></span>
                                    <span class="role-name">{{ rol.nombre }}</span>
                                </div>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-left justify-left">
                                    <div class="rounded-lg border"
                                        :style="{ background: rol.color, width: '28px', height: '28px' }">
                                    </div>
                                </div>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center justify-center gap-2">
                                    <button  @click="editarRol(rol)" v-if="puedeEditar('roles')" class="action-btn action-btn-edit px-3 py-1 rounded-lg text-xs border"><i
                                            data-lucide="pencil" class="action-btn-icon w-4 h-4"></i> </button>
                                    <button @click="eliminarRol(rol)" :disabled="!puedeEliminar('roles')" class="action-btn action-btn-del px-3 py-1 rounded-lg text-xs border"><i
                                            data-lucide="trash" class="action-btn-icon w-4 h-4"></i> </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div class="px-5 py-3 flex items-center justify-between border-t table-header">
                <span class="text-xs" style="color:#55526a;">Página {{ paginaActual }} de {{ totalPaginas }}</span>
                <div class="flex items-center gap-2">
                    <button class="pag-btn px-3 py-1 rounded-lg text-xs border" :disabled="paginaActual === 1" @click="paginaActual--">← Anterior</button>
                    <button class="pag-btn pag-btn-active px-3 py-1 rounded-lg text-xs border" v-for="page in totalPaginas" :key="page" @click="paginaActual = page" :class="{ 'pag-btn-active': paginaActual === page }">{{ page }}</button>
                    <button class="pag-btn px-3 py-1 rounded-lg text-xs border " :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente →</button>
                </div>
            </div>

        </div>
        <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este rol?" @cancel="confirmVisible = false" @confirm="confirmarEliminar"/>
        <rolModal v-if="modalVisible" :rol="rolSeleccionado" @close="() => {modalVisible = false; rolSeleccionado = null}" @save="crearRol" @update="actualizarRol"/>

    </div>
</template>