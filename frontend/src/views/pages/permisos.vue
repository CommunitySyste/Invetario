<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import {setupLucide} from '../../assets/js/lucide'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'

const auth = useAuthStore()
const roles = ref([])
const notif = useNotificationStore()
const rolSeleccionado = ref('')
const submenusDisponibles = ref([])
const submenuSeleccionado = ref('')
const permisos = ref([])
const updating  = ref(false)
const confirmVisible = ref(false)
const permisoAEliminar = ref(null)
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getRoles() {
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
    await getRoles();
    await setupLucide()
})

async function getSubmenusDisponibles(rol_id) {
    try{
        const { data } = await api.get(`/permisos/disponibles/${rol_id}`)
        submenusDisponibles.value = data
        notif.notify('Submenus disponibles recibidos exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify(error.response.data.message, 'error');
    }
}

watch(rolSeleccionado, async (newRol) => {

    paginaActual.value = 1

    submenuSeleccionado.value = '';
    submenusDisponibles.value = [];
    permisos.value = [];

    if (Number(newRol) === 1) {
        await getPermisos(newRol);
        return;
    }

    await getSubmenusDisponibles(newRol);
    await getPermisos(newRol);
})

async function getPermisos(rol_id) {
    try {
        const { data } = await api.get(`/permisos/${rol_id}`);
        permisos.value = data.map(p => ({
            ...p,
            puede_ver: p.puede_ver === 1,
            puede_editar: p.puede_editar === 1,
            puede_eliminar: p.puede_eliminar === 1,
            puede_crear: p.puede_crear === 1
        }));
        notif.notify('Permisos recibidos exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify(error.response.data.message, 'error');
    }
}

async function añadirPermiso(){
    if (!submenuSeleccionado.value){
        notif.notify('Selecciona un submenu', 'warning');
    }
    try {
        await api.post(`/permisos/asignar`, {
            rol_id: Number(rolSeleccionado.value),
            submenu_id: Number(submenuSeleccionado.value)
        });

        notif.notify('Permiso creado exitosamente', 'success');
        await getPermisos(rolSeleccionado.value);
        await getSubmenusDisponibles(rolSeleccionado.value);

        submenuSeleccionado.value = '';
    } catch (error) {
        notif.notify(error.response.data.message, 'error');
        console.error(error);
    }
}

async function actualizarPermiso (permiso) {
    if (updating.value) return;
    updating.value = true;
    try {
        await api.put(`/permisos/${permiso.id}`, {
            rol_id: Number(rolSeleccionado.value),
            submenu_id: permiso.submenu_id,
            puede_ver: permiso.puede_ver ? 1 : 0,
            puede_editar: permiso.puede_editar ? 1 : 0,
            puede_eliminar: permiso.puede_eliminar ? 1 : 0,
            puede_crear: permiso.puede_crear ? 1 : 0
        });
        await getPermisos(rolSeleccionado.value);
        await getSubmenusDisponibles(rolSeleccionado.value);

        submenuSeleccionado.value = '';
        notif.notify('Permiso actualizado exitosamente', 'success');
    } catch (error) {
        notif.notify(error.response.data.message, 'error');
    } finally {
        updating.value = false;
    }
}

function eliminarPermiso(permiso){
    permisoAEliminar.value = permiso;
    confirmVisible.value = true;
}

async function confirmarEliminar(){
    try {
        await api.delete(`/permisos/${permisoAEliminar.value.id}`);
        await getPermisos(rolSeleccionado.value);
        confirmVisible.value = false;
        permisoAEliminar.value = null;
        notif.notify('Permiso eliminado exitosamente', 'success');
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar el permiso', 'error');
    }
}

const totalPaginas = computed(() => {
    return Math.ceil(permisos.value.length / itemsPorPagina);
})

const permisosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return permisos.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 flex flex-col gap-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <p class="page-sub text-sm mt-1">Gestión de permisos del sistema</p>
            </div>
            <button @click="añadirPermiso" :disabled="Number(rolSeleccionado) === 1" v-if="puedeCrear('permiso')" class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                <i data-lucide="plus" class="btn-icon w-5 h-5"></i> Nuevo Permiso
            </button>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
                <div class="search-wrap flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                    style="color:#9490b0;">
                    <i data-lucide="user-round-key" class="search-icon w-4 h-4 text-gray-400"></i>
                    <select v-model="rolSeleccionado" class="bg-transparent outline-none text-sm cursor-pointer" style="color:#9490b0;">
                        <option v-for="rol in roles" :key="rol.id" :value="rol.id">{{ rol.nombre }}</option>
                    </select>
                </div>

                <div class="search-wrap flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                    style="color:#9490b0;">
                    <i data-lucide="menu" class="search-icon w-4 h-4 text-gray-400"></i>
                    <select v-model="submenuSeleccionado" v-if="Number(rolSeleccionado) !== 1" class="bg-transparent outline-none text-sm cursor-pointer" style="color:#9490b0;">
                        <option v-for="sub in submenusDisponibles" :key="sub.id" :value="sub.id" :disabled="!rolSeleccionado">{{ sub.nombre }}</option>
                    </select>
                    <p v-if="Number(rolSeleccionado) === 1" class="text-xs text-yellow-400">No puedes asignar permisos a un rol</p>
                </div>

            </div>

        </div>

        <!-- ── Tabla ── -->
        <div class="card rounded-xl border overflow-hidden">

            <!-- Header tabla -->
            <div class="table-header px-5 py-3 flex items-center justify-between border-b">
                <span class="text-xs font-medium uppercase tracking-widest" style="color:#55526a;">
                    Total: {{ permisos.length }} permisos
                </span>
                <span class="text-xs" style="color:#3e3c52;">Mostrando {{ permisosPaginados.length ? 1 : 0 }} – {{ permisosPaginados.length }} de {{ permisos.length }}</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">#</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Submenus</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Ver</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Añadir</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Editar</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Eliminar</th>
                            <th class="th text-center px-5 py-3 text-xs uppercase tracking-widest border-b">Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody v-if="Number(rolSeleccionado) !== 1 && permisos.length">
                        <!-- Fila 1 -->
                        <tr v-for="(permiso, index) in permisosPaginados" :key="permiso.id" class="table-row">
                            <td class="td px-5 py-3 text-sm border-b" style="color:#55526a;">{{  (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-left justify-left">
                                    {{ permiso.nombre }}
                                </div>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b"><input type="checkbox" :disabled="!puedeEditar(permiso)"
                                    class="w-4 h-4 accent-violet-500 cursor-pointer"  v-model="permiso.puede_ver" @change="actualizarPermiso(permiso)" /></td>
                            <td class="td px-5 py-3 text-sm border-b"><input type="checkbox" :disabled="!puedeEditar(permiso)"
                                    class="w-4 h-4 accent-violet-500 cursor-pointer"  v-model="permiso.puede_crear" @change="actualizarPermiso(permiso)" /></td>
                            <td class="td px-5 py-3 text-sm border-b"><input type="checkbox" :disabled="!puedeEditar(permiso)"
                                    class="w-4 h-4 accent-violet-500 cursor-pointer" v-model="permiso.puede_editar" @change="actualizarPermiso(permiso)" /></td>
                            <td class="td px-5 py-3 text-sm border-b"><input type="checkbox" :disabled="!puedeEditar(permiso)"
                                    class="w-4 h-4 accent-violet-500 cursor-pointer" v-model="permiso.puede_eliminar" @change="actualizarPermiso(permiso)" /></td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="eliminarPermiso(permiso)" :disabled="!puedeEliminar(permiso)" class="action-btn action-btn-del px-3 py-1 rounded-lg text-xs border"><i
                                            data-lucide="trash" class="action-btn-icon w-4 h-4"></i> </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="7" class="text-center py-6 text-sm text-gray-400">
                                <span v-if="Number(rolSeleccionado) === 1">
                                    No puedes asignar permisos a un rol
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
<confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este permiso?" @cancel="confirmVisible = false; permisoAEliminar = null" @confirm="confirmarEliminar"/>
            <!-- Paginación -->
            <div class="px-5 py-3 flex items-center justify-between border-t table-header">
                <span class="text-xs" style="color:#55526a;">Página {{ paginaActual }} de {{ totalPaginas }}</span>
                <div class="flex items-center gap-2">
                    <button class="pag-btn px-3 py-1 rounded-lg text-xs border" :disabled="paginaActual === 1" @click="paginaActual--">← Anterior</button>
                    <button class="pag-btn pag-btn-active px-3 py-1 rounded-lg text-xs border" v-for="page in totalPaginas" :key="page" @click="paginaActual = page" :class="{ 'pag-btn-active': paginaActual === page }">{{ page }}</button>
                    <button class="pag-btn px-3 py-1 rounded-lg text-xs border" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente →</button>
                </div>
            </div>

        </div>
    </div>
</template>
