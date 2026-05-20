import { useAuthStore } from '../stores/auth'

const tienePermiso = (ruta, accion) => {
    const auth = useAuthStore()

    if (!auth.permisos || auth.permisos.length === 0) return false;

    const item = auth.permisos.find(m => m.ruta === ruta);

    return item ? Number(item[accion]) === 1 : false;
}

export const puedeVer = (ruta) => tienePermiso(ruta, 'puede_ver')
export const puedeCrear = (ruta) => tienePermiso(ruta, 'puede_crear')
export const puedeEditar = (ruta) => tienePermiso(ruta, 'puede_editar')
export const puedeEliminar = (ruta) => tienePermiso(ruta, 'puede_eliminar')