export const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}