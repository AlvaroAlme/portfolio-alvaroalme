const form = document.querySelector("form");
const inputCantidad = document.getElementById("cantidad");
const inputNombreGasto = document.getElementById("nombre-gastos");
const selectFamilia = document.getElementById("categoria");
const mensajeError = document.getElementById("mensaje-error");

const CLAVE_STORAGE = "control-de-gastos.gastos";

let gastos = cargarGastos();

function cargarGastos(){
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if(!guardado){
        return [];
    }
    return JSON.parse(guardado);
}

function guardarGastos(){
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(gastos));
}

const listaGastos = document.getElementById("lista-gastos");

function renderGastos(){
    listaGastos.innerHTML = "";
    for(const gasto of gastos){
        const item = document.createElement("li");
        item.className = "gasto-item";

        const info = document.createElement("div");
        info.className = "gasto-info";

        const nombre = document.createElement("span");
        nombre.className = "gasto-nombre";
        nombre.textContent = gasto.nombre;

        const fecha = document.createElement("span");
        fecha.className = "gasto-fecha";
        fecha.textContent = gasto.fecha;

        info.appendChild(nombre);
        info.appendChild(fecha);

        const categoria = document.createElement("span");
        categoria.className = "gasto-categoria";
        categoria.textContent = gasto.categoria;

        const cantidad = document.createElement("span");
        cantidad.className = "gasto-cantidad";
        cantidad.textContent = `-${gasto.cantidad.toFixed(2)} €`;

        item.appendChild(info);
        item.appendChild(categoria);
        item.appendChild(cantidad);
        listaGastos.appendChild(item);
    }
}

function generarId(){
    if(gastos.length === 0){
        return 1;
    }
    const idsExistente = gastos.map((gasto) => gasto.id);
    return Math.max(...idsExistente) + 1;
}

function escaparCampoCSV(texto){
    const textoString = String (texto);
    if(textoString.includes(";") || textoString.includes(`"`)){
        return `"${textoString.replace(/"/g, '""')}"`;
    }
    return textoString;
}

function generarCSV(){
    const cabecera = "Fecha;Nombre;Categoria;Cantidad";
    const filas = gastos.map((gasto) => {
        return [
            escaparCampoCSV(gasto.fecha),
            escaparCampoCSV(gasto.nombre),
            escaparCampoCSV(gasto.categoria),
            gasto.cantidad.toFixed(2),
        ].join(";");
    });
    return [cabecera, ...filas].join("\n");
}

function descargarCSV(){
    if(gastos.length === 0){
        mensajeError.textContent = "No hay gastos que exportar.";
        return;
    }

    const contenidoCSV = generarCSV();
    const blob = new Blob (["\uFEFF" + contenidoCSV], {type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "gastos.csv";
    enlace.click();

    URL.revokeObjectURL(url);
}

const exportBtn = document.getElementById("exportar-btn");
exportBtn.addEventListener("click", descargarCSV);





form.addEventListener("submit", function (evento){
    evento.preventDefault();
    
    const textoCantidad = inputCantidad.value.trim().replace(",", ".");
    const cantidad = Number(textoCantidad);
    const nombre = inputNombreGasto.value.trim();
    const categoria = selectFamilia.value;

    if ( textoCantidad === "" || isNaN(cantidad) || cantidad <= 0){
        mensajeError.textContent = "Introduce una cantidad valida, mayor que 0";
        return;
    }
    if(nombre === ""){
        mensajeError.textContent = "Escribe un nombre para el gasto.";
        return;
    }
    if(categoria === ""){
        mensajeError.textContent = "Selecciona una categoria.";
        return;
    }

    
    mensajeError.textContent = "";
    const fecha = new Date().toLocaleDateString();

    const nuevoGasto = {
        id:generarId(),
        nombre: nombre,
        cantidad: cantidad,
        categoria: categoria,
        fecha: fecha,
    };

    gastos.push(nuevoGasto);
    guardarGastos();
    renderGastos();

    form.reset();

});

renderGastos();

