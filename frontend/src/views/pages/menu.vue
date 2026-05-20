<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import modalMenu from '../../components/menuModal.vue'
import subMenuModal from '../../components/subMenuModal.vue'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'

const auth = useAuthStore();
const menus = ref([]);
const notif = useNotificationStore();
const modalVisible = ref(false);
const search = ref('');
const menuSeleccionado = ref(null);
const confirmVisible = ref(false);
const menuAEliminar = ref(null);
const subMenuVisible = ref(false);
const menuParaSubmenu = ref(null);
const itemsPorPagina = 10
const paginaActual = ref(1)

async function getMenus() {
    try {
        const { data } = await api.get('/menus');
        menus.value = data;
        notif.notify('menus recibidos exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getMenus();
})

async function crearMenu(data) {
    try {
        await api.post('/menus', data);
        notif.notify('Menu creado exitosamente', 'success');
        modalVisible.value = false;
        await getMenus();
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el menu', 'error');
    }
}

async function abrirEditar(menu) {
    menuSeleccionado.value = menu;
    modalVisible.value = true;
}

async function actualizarMenu(data) {
    try {
        await api.put(`/menus/${data.id}`, data);
        notif.notify('Menu actualizado exitosamente', 'success');
        modalVisible.value = false;
        await getMenus();
        menuSeleccionado.value = null;
    } catch (error) {
        notif.notify('Error al actualizar el menu', 'error');
    }
}

async function eliminarMenu(menu) {
    menuAEliminar.value = menu;
    confirmVisible.value = true;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/menus/${menuAEliminar.value.id}`);
        await getMenus();
        confirmVisible.value = false;
        menuAEliminar.value = null;
        notif.notify('Menu eliminado exitosamente', 'success');
    } catch (error) {
        console.error(error);
        notif.notify('Error al eliminar el menu', 'error');
    }
}

const menusFiltrados = computed(() => {
    if (!search.value) return menus.value;

    return menus.value.filter(menu => menu.nombre.toLowerCase().includes(search.value.toLowerCase()));
})

async function verSubmenus(menu) {
    menuParaSubmenu.value = menu;
    subMenuVisible.value = true;
}

const totalPaginas = computed(() => {
    return Math.ceil(menusFiltrados.value.length / itemsPorPagina);
})

const menusPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    return menusFiltrados.value.slice(inicio, fin);
})
</script>
<template>
    <div class="p-6 flex flex-col gap-6">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <p class="page-sub text-sm mt-1">Gestión de Menus del sistema</p>
            </div>
            <button @click="modalVisible = true" v-if="puedeCrear('menu')"
                class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                <i data-lucide="plus" class="btn-icon w-4 h-4"></i> Nuevo Usuario
            </button>
        </div>

        <!-- Filtros -->
        <div class="flex items-center gap-3 flex-wrap">

            <div class="search-wrap flex items-center gap-2 px-3 py-2 rounded-xl border flex-1"
                style="max-width:300px;">
                <i data-lucide="search" class="search-icon w-4 h-4 text-gray-400"></i>
                <input v-model="search" type="text" placeholder="Buscar usuario..."
                    class="bg-transparent outline-none text-sm w-full search-input" />
            </div>

        </div>

        <!-- Tabla -->
        <div class="card rounded-xl border overflow-hidden">

            <!-- Contador -->
            <div class="table-header px-5 py-3 flex items-center justify-between border-b">
                <span class="text-xs font-medium uppercase tracking-widest" style="color:#55526a;">
                    Total: {{ menus.length }} menus
                </span>
                <span class="text-xs" style="color:#3e3c52;">Mostrando {{ menus.length ? 1 : 0 }} – 1 de {{ menus.length}}</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">#</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Nombre</th>
                            <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Icono</th>
                            <th class="th text-center px-5 py-3 text-xs uppercase tracking-widest border-b">Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr v-for="(menu, index) in menusPaginados" :key="menu.id" class="table-row">
                            <td class="td px-5 py-3 text-sm border-b" style="color:#55526a;">{{  (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center gap-3">
                                    <span>{{ menu.nombre }}</span>
                                </div>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <span
                                    class="text-xs font-medium px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 flex items-center gap-1 w-fit">
                                    <i :data-lucide="menu.icono" class="w-4 h-4"></i>
                                </span>
                            </td>
                            <td class="td px-5 py-3 text-sm border-b">
                                <div class="flex items-center justify-center gap-2">
                                    <button @click="verSubmenus(menu)" :disabled="!puedeEditar('menu')"
                                        class="action-btn px-3 py-1 rounded-lg text-xs border flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white border-green-500">
                                        <i data-lucide="eye" class="action-btn-icon w-3 h-3"></i>
                                    </button>
                                    <button @click="abrirEditar(menu)" v-if="puedeEditar('menu')"
                                        class="action-btn px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
                                        <i data-lucide="pencil" class="action-btn-icon w-3 h-3"></i>
                                    </button>
                                    <button @click="eliminarMenu(menu)" :disabled="!puedeEliminar('menu')"
                                        class="action-btn action-btn-del px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
                                        <i data-lucide="trash" class="action-btn-icon w-3 h-3"></i>
                                    </button>
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
                    <button class="pag-btn px-3 py-1 rounded-lg text-xs border" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente →</button>
                </div>
            </div>
            <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este menu?" @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
            <modalMenu v-if="modalVisible" :menu="menuSeleccionado" @close="() => { modalVisible = false; menuSeleccionado = null }" @save="crearMenu" @update="actualizarMenu" />
            <subMenuModal v-if="subMenuVisible" :menu="menuParaSubmenu" @close="() => { subMenuVisible = false; menuParaSubmenu = null }" />
        </div>
    </div>
</template>
<style scoped></style>