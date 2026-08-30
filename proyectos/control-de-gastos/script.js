const form = document.querySelector("form");
const inputCantidad = document.getElementById("cantidad");
const inputNombreGasto = document.getElementById("nombre-gastos");
const selectFamilia = document.getElementById("categoria");
const mensajeError = document.getElementById("mensaje-error");
const formCategoria = document.getElementById("categoria-form");
const inputNuevaCategoria = document.getElementById("nueva-categoria");

const CLAVE_STORAGE = "control-de-gastos.gastos";

let gastos = cargarGastos();

function cargarGastos(){
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if(!guardado){
        return [];
    }
    const datos = JSON.parse(guardado);
    return datos.map((movimiento) => ({
        ...movimiento,
        tipo: movimiento.tipo ?? "gasto",
    }));
}

const CLAVE_STORAGE_CATEGORIAS = "control-de-gastos.categorias";
const CATEGORIAS_POR_DEFECTO = [
    "Supermercado",
    "Deporte",
    "Ropa",
    "Regalos",
    "Suministros",
    "Educacion",
    "Ocio",
    "Salud",
    "Transporte",
    "Deudas",
    "Mascotas",
    "Niños",
    "Otros",
];

function cargarCategorias(){
    const guardado = localStorage.getItem(CLAVE_STORAGE_CATEGORIAS);
    if(!guardado){
        return [...CATEGORIAS_POR_DEFECTO];
    }
    return JSON.parse(guardado);
}

function guardarCategorias(){
    localStorage.setItem(CLAVE_STORAGE_CATEGORIAS, JSON.stringify(categorias));
}

let categorias = cargarCategorias();

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
        const esIngreso = gasto.tipo === "ingreso";
        cantidad.className = esIngreso ? "gasto-cantidad gasto-cantidad--ingreso" : "gasto-cantidad";
        const signo = esIngreso ? "+" : "-";
        cantidad.textContent = `${signo}${gasto.cantidad.toFixed(2)} €`;

        item.appendChild(info);
        item.appendChild(categoria);
        item.appendChild(cantidad);
        listaGastos.appendChild(item);
    }
}

function renderCategorias(){
    selectFamilia.innerHTML = '<option value="" selected disabled>Selecciona una opcion</option>';
    for(const categoria of categorias){
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectFamilia.appendChild(opcion);
    }

    const listaCategorias = document.getElementById("lista-categorias");
    listaCategorias.innerHTML = "";
    for(const categoria of categorias){
        const item = document.createElement("li");
        item.textContent = categoria;
        listaCategorias.appendChild(item);
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
    const cabecera = "Fecha;Nombre;Categoria;Tipo;Cantidad";
    const filas = gastos.map((gasto) => {
        return [
            escaparCampoCSV(gasto.fecha),
            escaparCampoCSV(gasto.nombre),
            escaparCampoCSV(gasto.categoria),
            escaparCampoCSV(gasto.tipo),
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


function calcularTotales(){
    let totalGastos = 0;
    let totalIngresos = 0;

    for(const gasto of gastos){
        if(gasto.tipo === "ingreso"){
            totalIngresos += gasto.cantidad;
        } else {
            totalGastos += gasto.cantidad;
        }
    }

    return {
        totalGastos: totalGastos,
        totalIngresos: totalIngresos,
        balance: totalIngresos - totalGastos,
    };
}

function calcularGastosPorCategoria(){
    const totalesPorCategoria = {};

    for(const gasto of gastos){
        if(gasto.tipo === "ingreso"){
            continue;
        }
        const acumulado = totalesPorCategoria[gasto.categoria] ?? 0;
        totalesPorCategoria[gasto.categoria] = acumulado + gasto.cantidad;
    }
    return totalesPorCategoria;
}

function categoriaConMasGasto(totalesPorCategoria){
    const entradas = Object.entries(totalesPorCategoria);
    if(entradas.length === 0){
        return null;
    }
    return entradas.reduce(function (max, actual){
        return actual[1] > max [1] ? actual : max;
    });
}

function renderAnalisis(){
    const totales = calcularTotales();

    document.getElementById("total-ingresos").textContent = `${totales.totalIngresos.toFixed(2)} €`;
    document.getElementById("total-gastos").textContent = `${totales.totalGastos.toFixed(2)} €`;
    const signoBalance = totales.balance >= 0 ? "+" : "-";
    document.getElementById("balance").textContent = `${signoBalance}${Math.abs(totales.balance).toFixed(2)}€`;

    const totalesPorCategoria = calcularGastosPorCategoria();
    const cuerpoTabla = document.getElementById("tabla-categorias-cuerpo");
    cuerpoTabla.innerHTML="";

    for(const [categoria, total] of Object.entries(totalesPorCategoria)){
        const fila = document.createElement("tr");

        const celdaCategoria = document.createElement("td");
        celdaCategoria.textContent = categoria;

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent=`${total.toFixed(2)}€`;

        fila.appendChild(celdaCategoria);
        fila.appendChild(celdaTotal);
        cuerpoTabla.appendChild(fila);
    }

    const maxCategoria = categoriaConMasGasto(totalesPorCategoria);
    const textoDestacado = document.getElementById("categoria-destacada");
    textoDestacado.textContent = maxCategoria ? `Mas gasto en: ${maxCategoria[0]} (${maxCategoria[1].toFixed(2)}€)` : "Todavia no hay gastos.";
}


const exportBtn = document.getElementById("exportar-btn");
exportBtn.addEventListener("click", descargarCSV);





form.addEventListener("submit", function (evento){
    evento.preventDefault();
    
    const textoCantidad = inputCantidad.value.trim().replace(",", ".");
    const cantidad = Number(textoCantidad);
    const nombre = inputNombreGasto.value.trim();
    const categoria = selectFamilia.value;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;

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
        tipo: tipo,
    };

    gastos.push(nuevoGasto);
    guardarGastos();
    renderGastos();
    renderAnalisis();

    form.reset();

});

formCategoria.addEventListener("submit", function (evento){
    evento.preventDefault();

    const nombreCategoria = inputNuevaCategoria.value.trim();

    if(nombreCategoria === ""){
        return;
    }

    if(categorias.includes(nombreCategoria)){
        return;
    }

    categorias.push(nombreCategoria);
    guardarCategorias();
    renderCategorias();

    formCategoria.reset();
});

renderGastos();
renderCategorias();
renderAnalisis();

const botonesTab = document.querySelectorAll(".tab-btn");
const panelesTab = document.querySelectorAll(".tab-panel");

botonesTab.forEach(function (boton) {
    boton.addEventListener("click", function () {
        const destino = boton.dataset.tab;

        botonesTab.forEach(function (b) {
            b.classList.toggle("activo", b === boton);
        });

        panelesTab.forEach(function (panel) {
            panel.classList.toggle("activo", panel.id === destino);
        });
    });
});