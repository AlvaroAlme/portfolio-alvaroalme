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
        item.textContent = `${gasto.fecha} — ${gasto.nombre} — ${gasto.cantidad.toFixed(2)} € (${gasto.categoria})`;
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

