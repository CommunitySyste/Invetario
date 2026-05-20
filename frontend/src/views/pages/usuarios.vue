<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/toastNotify'
import api from '../../api/axios'
import confirModal from '../../components/confirModal.vue'
import userModal from '../../components/userModal.vue'
import { puedeVer, puedeCrear, puedeEditar, puedeEliminar } from '../../helper/permisos'

const auth = useAuthStore();
const usuarios = ref([]);
const notif = useNotificationStore();
const modalVisible = ref(false);
const usuarioSeleccionado = ref(null);
const confirmVisible = ref(false);
const usuarioAEliminar = ref(null);
const search = ref('');
const paginaActual = ref(1);
const itemsPorPagina = 10

async function getUsuarios() {
    try {
        const { data } = await api.get('/users');
        usuarios.value = data;
        notif.notify('Usuarios recibidos exitosamente', 'success');
    } catch (error) {
        console.error(error);
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(async () => {
    await getUsuarios();
})

async function crearUsuario(data){
  try {
    await api.post('/users', data);
    notif.notify('Usuario creado exitosamente', 'success');
    modalVisible.value = false;
    await getUsuarios();
  } catch (error) {
    console.error(error);
    notif.notify('Error al crear el usuario', 'error');
  }
}

async function abrirEditar(usuario){
  usuarioSeleccionado.value = usuario;
  modalVisible.value = true;
}

async function actualizarUsuario(data){
  try{
    await api.put(`/users/${data.id}`, data);

    modalVisible.value = false;
    usuarioSeleccionado.value = null;

    await getUsuarios();

    notif.notify('Usuario actualizado', 'success');

  } catch (error) {
    console.error(error);
    notif.notify('Error al actualizar', 'error');
  }
}

async function eliminarUsuario(user){
  usuarioAEliminar.value = user;
  confirmVisible.value = true;
}

async function confirmarEliminar(){
  try {
    await api.delete(`/users/${usuarioAEliminar.value.id}`);
    await getUsuarios();
    confirmVisible.value = false;
    usuarioAEliminar.value = null;
    notif.notify('Usuario eliminado exitosamente', 'success');
  } catch (error) {
    console.error(error);
    notif.notify('Error al eliminar el usuario', 'error');
  }
}

const usersFiltrados = computed(() => {
  if (!search.value) return usuarios.value;

   return usuarios.value.filter(user =>
    user.username.toLowerCase().includes(search.value.toLowerCase()));
})

const totalPaginas = computed(() => {
  return Math.ceil(usuarios.value.length / itemsPorPagina);
})

const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;

  return usersFiltrados.value.slice(inicio, fin);
})
</script>
<template>
  <div class="p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <p class="page-sub text-sm mt-1">Gestión de usuarios del sistema</p>
      </div>
      <button @click="modalVisible= true" v-if="puedeCrear('usuarios')" class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
        <i data-lucide="plus" class="btn-icon w-4 h-4"></i> Nuevo Usuario
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex items-center gap-3 flex-wrap">

      <div class="search-wrap flex items-center gap-2 px-3 py-2 rounded-xl border flex-1" style="max-width:300px;">
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
          Total: {{ usuarios.length }} usuarios
        </span>
        <span class="text-xs" style="color:#3e3c52;">Mostrando {{ usersFiltrados.length ? 1 : 0 }} – 1 de {{ usuarios.length }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">#</th>
              <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Usuario</th>
              <th class="th text-left px-5 py-3 text-xs uppercase tracking-widest border-b">Rol</th>
              <th class="th text-center px-5 py-3 text-xs uppercase tracking-widest border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="(user, index) in usuariosPaginados" :key="user.id" class="table-row">
              <td class="td px-5 py-3 text-sm border-b" style="color:#55526a;">{{ (paginaActual - 1) * itemsPorPagina + index + 1 }}</td>
              <td class="td px-5 py-3 text-sm border-b">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-400">{{ user.username.slice(0,2).toUpperCase() }}</div>
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td class="td px-5 py-3 text-sm border-b">
                <span class="text-xs font-medium px-2 py-1 rounded-md bg-violet-500/10 text-violet-400">{{ user.rol }}</span>
              </td>
              <td class="td px-5 py-3 text-sm border-b">
                <div class="flex items-center justify-center gap-2">
                  <button @click="abrirEditar(user)" v-if="puedeEditar('usuarios')" class="action-btn action-btn-edit px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
                    <i data-lucide="pencil" class="action-btn-icon w-3 h-3"></i>
                  </button>
                  <button @click="eliminarUsuario(user)" :disabled="!puedeEliminar('usuarios')" class="action-btn action-btn-del px-3 py-1 rounded-lg text-xs border flex items-center gap-1">
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

    </div>
    <confirModal v-if="confirmVisible" message="¿Seguro que deseas eliminar este usuario?" @cancel="confirmVisible = false" @confirm="confirmarEliminar"/>
    <userModal v-if="modalVisible" :user="usuarioSeleccionado" @close="() => { modalVisible = false; usuarioSeleccionado = null }" @save="crearUsuario" @update="actualizarUsuario"/>
  </div>
</template>
<style scoped>

</style>
  