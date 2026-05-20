<script setup>
import { ref, onMounted, nextTick } from "vue";
import api from "../api/axios";
import { useNotificationStore } from "../stores/toastNotify";
import { setupLucide } from '../assets/js/lucide'
import confirModal from '../components/confirModal.vue'
import subModal from '../components/subModal.vue'

const props = defineProps({
    menu: Object,
});

const emit = defineEmits(["close"]);
const notif = useNotificationStore();
const formVisible = ref(false);
const submenuSeleccionado = ref(null);
const confirmVisible = ref(false);
const submenuAEliminar = ref(null);

const submenus = ref([]);

async function getSubmenus() {
    try {
        const { data } = await api.get(`/submenus/menu/${props.menu.id}`);
        submenus.value = data;
        notif.notify("Submenus recibidos exitosamente", "success");
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify("Error al cargar submenus", "error");
    }
}

onMounted(() => {
    getSubmenus();
    setupLucide();
});

function editarSubmenu(submenu) {
    submenuSeleccionado.value = submenu;
    formVisible.value = true;
}

function eliminarSubmenu(submenu) {
    submenuAEliminar.value = submenu;
    confirmVisible.value = true;
}

async function confirmarEliminar() {
    try {
        await api.delete(`/submenus/${submenuAEliminar.value.id}`);
        await getSubmenus();
        confirmVisible.value = false;
        submenuAEliminar.value = null;
        notif.notify('Submenu eliminado exitosamente', 'success');
        await nextTick()
        setupLucide()
    } catch (error) {
        notif.notify('Error al eliminar el submenu', 'error');
    }
}

async function crearSubmenu(data) {
    try {

        await api.post('/submenus', {
            ...data,
            menu_id: props.menu.id  
        });

        notif.notify('Submenu creado exitosamente', 'success');
        formVisible.value = false;
        await getSubmenus();
        await nextTick()
        setupLucide()
    } catch (error) {
        console.error(error);
        notif.notify('Error al crear el submenu', 'error');
    }
}

async function actualizarSubmenu(data) {
    try {
        await api.put(`/submenus/menu/${data.id}`, data);
        notif.notify('Submenu actualizado exitosamente', 'success');
        formVisible.value = false;
        await getSubmenus();
        submenuSeleccionado.value = null;
    } catch (error) {
        notif.notify('Error al actualizar el submenu', 'error');
    }
}
</script>
<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-70 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 780px">
            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">Submenus de {{ menu.nombre }}</h2>
                </div>
                <button @click="emit('close')"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕
                </button>
            </div>

            <div class="modal-divider"></div>

            <!-- Campos -->
            <div class="flex flex-col gap-6">
                <div class="card rounded-xl border overflow-hidden">
                    <!-- Contador -->
                    <div class="table-header px-5 py-3 flex items-center justify-between border-b">
                        <span class="text-xs font-medium uppercase tracking-widest" style="color: #55526a">
                            Total: {{ submenus.length }} menus
                        </span>
                        <span class="text-xs" style="color: #3e3c52">Mostrando {{ submenus.length ? 1 : 0 }} – 1 de {{
                            submenus.length }}</span>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">#</th>
                                <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Nombre
                                </th>
                                <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">ruta</th>
                                <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">icono</th>
                                <th class="th text-center px-5 py-3 text-xs uppercase tracking-widest border-b">Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(submenu, index) in submenus" :key="submenu.id" class="table-row">
                                <td class="td px-5 py-3 text-sm border-b" style="color:#55526a;">{{ index + 1 }}</td>
                                <td class="td px-5 py-3 text-sm border-b">
                                    <div class="flex items-center gap-2">
                                        <span class="prod-dot"></span>
                                        <span class="prod-name">{{ submenu.nombre }}</span>
                                    </div>
                                </td>
                                <td class="td px-5 py-3 text-sm border-b">{{ submenu.ruta }}</td>
                                <td class="td px-5 py-3 text-sm border-b">
                                    <span
                                        class="text-xs font-medium px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 flex items-center gap-1 w-fit">
                                        <i :data-lucide="submenu.icono" class="w-4 h-4"></i>
                                    </span>
                                </td>
                                <td class="td px-5 py-3 text-sm border-b">
                                    <div class="flex items-center justify-center gap-2">
                                        <button @click="editarSubmenu(submenu)"
                                            class="action-btn px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
                                            <i data-lucide="pencil" class="action-btn-icon w-3 h-3"></i>
                                        </button>
                                        <button @click="eliminarSubmenu(submenu)"
                                            class="action-btn action-btn-del px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
                                            <i data-lucide="trash" class="action-btn-icon w-3 h-3"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="formVisible = true"
                    class="px-4 py-2 rounded-xl text-sm border flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white border-green-500">
                    <i data-lucide="pencil" class="w-4 h-4"></i>
                    Nuevo Submenu
                </button>
            </div>
        </div>
    </div>
    <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este submenu?" @cancel="confirmVisible = false" @confirm="confirmarEliminar" />
    <subModal 
    v-if="formVisible" 
    :submenu="submenuSeleccionado" 
    @close="() => { formVisible = false; submenuSeleccionado = null }" 
    @save="crearSubmenu" 
    @update="actualizarSubmenu" 
/>
</template>
