export const soloNumero = (value) => {
  return value.replace(/\D/g, "").replace(/^0+/, "");
};

export const soloNumeroDecimal = (value) => {
  value = value.replace(/[^0-9.]/g, "");

  const decimales = value.split(".");
  if (decimales.length > 2) {
    value = decimales[0] + "." + decimales[1];
  }
  if (decimales[1]?.length > 2) {
    value = decimales[0] + "." + decimales[1].slice(0, 2);
  }
  return value;
};

export const codigospais = [
  { codigo: "+593", pais: "Ecuador", longitud: 9 },
  { codigo: "+57", pais: "Colombia", longitud: 10 },
  { codigo: "+51", pais: "Peru", longitud: 9 },
  { codigo: "+52", pais: "Mexico", longitud: 10 },
  { codigo: "+56", pais: "Chile", longitud: 9 },
];

export const soloTelefono = (value) => {
  return value.replace(/\D/g, "").slice(0, 10);
};
export const validarTelefono = (codigo, numero) => {
  const pais = codigospais.find((p) => p.codigo === codigo);

  if (!pais) {
    return { valid: false, message: "Codigo de pais no válido" };
  }

  const soloDigitos = numero.replace(/\D/g, "");
  if (soloDigitos.length !== pais.longitud) {
    return {
      valido: false,
      message: "El número de teléfono no es válido",
    };
  }
  return { valid: true, message: "Teléfono válido" };
};
