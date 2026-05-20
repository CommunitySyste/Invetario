<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import '../assets/css/rolModal.css'
import { useNotificationStore } from '../stores/toastNotify'
import { toUpperCase } from '../helper/textHelper'
import { setupLucide } from '../assets/js/lucide'
import api from '../api/axios'
import { soloNumero, soloNumeroDecimal } from '../helper/inputHelper'

const props = defineProps({
    producto: Object
})
const emit = defineEmits(['close', 'save', 'update'])
const notif = useNotificationStore()
const nombre = ref('')
const categoria_id = ref('')
const stock = ref('')
const precio = ref('')
const imagen = ref('')
const estado = ref('')
const descripcion = ref('');
const proveedor_id = ref('');
const created_at = ref('');
const categoriasFiltrados = ref([]);
const imagenFile = ref(null);
const proveedoresFiltrados = ref([]);


async function getCategorias() {
    try {
        const { data } = await api.get('/categorias');
        categoriasFiltrados.value = data;
        notif.notify('Categorias recibidas exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

async function getProveedores() {
    try {
        const { data } = await api.get('/proveedores');
        proveedoresFiltrados.value = data;
        notif.notify('Proveedores recibidos exitosamente', 'success');
    } catch (error) {
        notif.notify('Error al conectar con la base de datos', 'error');
    }
}

onMounted(() => {
    setupLucide(),
    getCategorias(),
    getProveedores()
})


function guardar() {
    if (!nombre.value || !descripcion.value || !categoria_id.value || stock.value === '' || precio.value === '' || !estado.value || !proveedor_id.value) {
        notif.notify('Campos obligatorios', 'warning');
        return;
    }

    const formData = new FormData();

    formData.append('nombre', nombre.value);
    formData.append('categoria_id', categoria_id.value);
    formData.append('stock', parseInt(stock.value));
    formData.append('precio', parseFloat(precio.value).toFixed(2));
    formData.append('estado', estado.value);
    formData.append('descripcion', descripcion.value);
    formData.append('proveedor_id', proveedor_id.value);

    if (imagenFile.value) {
        formData.append('imagen', imagenFile.value);
    }

    if (props.producto) {
        formData.append('id', props.producto.id);
        emit('update', formData);
    } else {
        emit('save', formData);
    }
}

watch(() => props.producto, (newProdutos) => {
    if (newProdutos) {
        nombre.value = newProdutos.nombre;
        categoria_id.value = newProdutos.categoria_id;
        stock.value = newProdutos.stock;
        precio.value = newProdutos.precio;
        estado.value = newProdutos.estado;
        descripcion.value = newProdutos.descripcion;
        proveedor_id.value = newProdutos.proveedor_id;
        imagen.value = newProdutos.imagen
            ? `http://localhost:3000/uploads/productos/${newProdutos.imagen}`
            : null;
    } else {
        nombre.value = '';
        categoria_id.value = '';
        stock.value = '';
        precio.value = '';
        imagenFile.value = null;
        estado.value = '';
        descripcion.value = '';
        proveedor_id.value = '';
    }
}, { immediate: true })

function cerrarmodal() {
    nombre.value = '';
    descripcion.value = '';
    categoria_id.value = '';
    stock.value = '';
    precio.value = '';
    imagenFile.value = null;
    estado.value = '';
    proveedor_id.value = '';

    emit('close');
}

const idEdit = computed(() => {
    return props.producto ? props.producto.id : null;
})

function handleImagen(e) {
    const file = e.target.files[0];

    if (!file) {
        imagen.value = '';
        imagenFile.value = null;
        return;
    }

    const tiposPermitidos = ['image/jpeg', 'image/png'];
    if (!tiposPermitidos.includes(file.type)) {
        notif.notify('Solo JPG o PNG', 'warning');
        return;
    }

    imagenFile.value = file;

    imagen.value = URL.createObjectURL(file);
}

</script>

<template>
    <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 px-4">
        <div class="modal-box rounded-2xl border p-6 flex flex-col gap-5 w-full" style="max-width: 780px;">

            <!-- Cabecera -->
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-0.5">
                    <h2 class="text-base font-semibold modal-title">
                        {{ idEdit ? 'Editar Producto' : 'Nuevo Producto' }}
                    </h2>
                    <p class="text-xs modal-sub">Completa los campos para {{ idEdit ? 'editar el producto' : 'crear el}producto' }}</p>
                </div>
                <button @click="cerrarmodal"
                    class="modal-close w-8 h-8 rounded-lg flex items-center justify-center text-sm border">✕</button>
            </div>

            <div class="modal-divider"></div>

            <div class="flex gap-6">

                <!-- Columna izquierda: Imagen -->
                <div class="flex flex-col items-center gap-3" style="width: 180px; flex-shrink: 0;">
                    <label class="text-xs font-medium uppercase tracking-widest field-label self-start">
                        Imagen <span class="field-required">*</span>
                    </label>

                    <!-- Preview redondo -->
                    <div v-if="imagen" class="rounded-full border-2 border-violet-600 overflow-hidden"
                        style="width: 120px; height: 120px; flex-shrink: 0;">
                        <img :src="imagen" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                        class="field-input rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-1"
                        style="width: 120px; height: 120px; flex-shrink: 0;">
                        <i data-lucide="image-plus" class="w-6 h-6 text-gray-500"></i>
                        <p class="text-[10px] text-gray-500 text-center">Sin imagen</p>
                    </div>

                    <!-- Botón subir -->
                    <label
                        class="field-input flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer hover:border-violet-600 transition w-full justify-center">
                        <i data-lucide="upload" class="w-3.5 h-3.5 text-gray-400 shrink-0"></i>
                        <span class="text-xs text-gray-400">{{ imagen ? 'Cambiar' : 'Seleccionar' }}</span>
                        <input type="file" accept=".jpg,.jpeg,.png" class="hidden" @change="handleImagen" />
                    </label>
                    <p class="text-[10px] field-hint text-center">Solo JPG o PNG</p>
                </div>

                <!-- Columna derecha: Campos en grid 2x2 -->
                <div class="flex flex-col gap-4 flex-1">

                    <!-- Fila 1: Nombre + Categoría -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Nombre <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="between-horizontal-end" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="nombre" @input="nombre = toUpperCase($event.target.value)" type="text"
                                    placeholder="Ej: Calzado" class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Categoría <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="square-stack" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="categoria_id"
                                    class="bg-transparent outline-none text-sm w-full cursor-pointer"
                                    style="color:#9490b0;">
                                    <option value="">Selecciona</option>
                                    <option v-for="categoria in categoriasFiltrados" :key="categoria.id"
                                        :value="categoria.id">
                                        {{ categoria.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Fila 2: Stock + Precio -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Stock <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="shelving-unit" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="stock" type="text" placeholder="Ej: 43"
                                    @input="stock = soloNumero($event.target.value)"
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Precio <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="badge-dollar-sign" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input :value="precio" type="text" placeholder="Ej: 12.50"
                                    @input="precio = soloNumeroDecimal($event.target.value); $event.target.value = precio"
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Fila 3: Estado + Descripción -->
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Estado <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="toggle-right" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="estado"
                                    class="bg-transparent outline-none text-sm w-full cursor-pointer"
                                    style="color:#9490b0;">
                                    <option value="">Selecciona</option>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Descripción <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="proportions" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <input v-model="descripcion" type="text" placeholder="Ej: Descripción"
                                    class="bg-transparent outline-none text-sm w-full" />
                            </div>
                        </div>
                    </div>
                    <!-- Fila 4: Proveedor solo -->
                    <div class="grid grid-cols-1 gap-3">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-medium uppercase tracking-widest field-label">
                                Proveedor <span class="field-required">*</span>
                            </label>
                            <div class="field-input flex items-center gap-2 px-3 py-2.5 rounded-xl border">
                                <i data-lucide="truck" class="w-4 h-4 text-gray-400 shrink-0"></i>
                                <select v-model="proveedor_id"
                                    class="bg-transparent outline-none text-sm w-full cursor-pointer"
                                    style="color:#9490b0;">
                                    <option value="">Selecciona</option>
                                    <option v-for="proveedor in proveedoresFiltrados" :key="proveedor.id"
                                        :value="proveedor.id">
                                        {{ proveedor.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-divider"></div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3">
                <button @click="cerrarmodal" class="btn-cancel px-4 py-2 rounded-xl text-sm border">Cancelar</button>
                <button @click="guardar"
                    class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                    <i data-lucide="save" class="btn-icon w-4 h-4"></i> {{ idEdit ? 'Actualizar' : 'Guardar' }}
                </button>
            </div>

        </div>
    </div>
</template>