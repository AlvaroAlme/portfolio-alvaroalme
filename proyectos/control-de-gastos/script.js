const form = document.querySelector("form");
const inputCantidad = document.getElementById("cantidad");
const inputNombreGasto = document.getElementById("nombre-gastos");
const selectFamilia = document.getElementById("categoria");
const mensajeError = document.getElementById("mensaje-error");
const formCategoria = document.getElementById("categoria-form");
const inputNuevaCategoria = document.getElementById("nueva-categoria");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
const inputFecha = document.getElementById("fecha");
const inputFechaDesde = document.getElementById("fecha-desde");
const inputFechaHasta = document.getElementById("fecha-hasta");
const inputBuscadorAnalisis = document.getElementById("buscador-analisis");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

const CLAVE_STORAGE = "control-de-gastos.gastos";

let gastos = cargarGastos();
let idEnEdicion = null;

let graficoCategorias = null;
let graficoBalance = null;

const COLORES_CATEGORIAS = [
    "#3b5d42", "#7a2e22", "#a8763e", "#4f6d7a", "#8a8c5f",
    "#7d5a8c", "#b08d57", "#5c7a5e", "#9c5148", "#6b7268",
];
const CLAVE_STORAGE_COLORES = "control-de-gastos.coloresCategorias";

function cargarColoresCategorias(){
    const guardado = localStorage.getItem(CLAVE_STORAGE_COLORES);
    if(!guardado){
        return {};
    }
    return JSON.parse(guardado);
}

function guardarColoresCategorias(){
    localStorage.setItem(CLAVE_STORAGE_COLORES, JSON.stringify(coloresCategorias));
}

let coloresCategorias = cargarColoresCategorias();

function generarColorAleatorio(){
    const tono = Math.floor(Math.random() * 360);
    return `hsl(${tono}, 35%, 40%)`;
}

function obtenerColorParaCategoria(categoria){
    if(coloresCategorias[categoria]){
        return coloresCategorias[categoria];
    }

    const coloresUsados = Object.values(coloresCategorias);
    let colorNuevo = COLORES_CATEGORIAS.find((color) => !coloresUsados.includes(color));

    if(!colorNuevo){
        do {
            colorNuevo = generarColorAleatorio();
        } while (coloresUsados.includes(colorNuevo));
    }

    coloresCategorias[categoria] = colorNuevo;
    guardarColoresCategorias();
    return colorNuevo;
}

function actualizarGraficos(listaGastos){
    const totalesPorCategoria = calcularGastosPorCategoria(listaGastos);
    const categorias = Object.keys(totalesPorCategoria);

    if(graficoCategorias){
        graficoCategorias.destroy();
    }
    graficoCategorias = new Chart(document.getElementById("grafico-categorias"), {
        type: "pie",
        data: {
            labels: categorias,
            datasets: [{
                data: Object.values(totalesPorCategoria),
                backgroundColor: categorias.map((categoria) => obtenerColorParaCategoria(categoria)),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });


    const balance = calcularBalanceAcumulado(listaGastos);

    if(graficoBalance){
        graficoBalance.destroy();
    }
    graficoBalance = new Chart(document.getElementById("grafico-balance"), {
        type: "line",
        data: {
            labels: balance.etiquetas,
            datasets: [{
                label: "Balance acumulado",
                data: balance.valores,
                borderColor: "#3b5d42",
                fill: false,
                tension: 0.2,
            }],
        },
        options: { responsive: true, maintainAspectRatio: false },
    });
}

function cargarGastos(){
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if(!guardado){
        return [];
    }
    const datos = JSON.parse(guardado);
    return datos.map((movimiento) => ({
        ...movimiento,
        tipo: movimiento.tipo ?? "gasto",
        fecha: normalizarFecha(movimiento.fecha),
    }));
}

function prepararEdicion(id){
    const gasto = gastos.find((g) => g.id === id);
    if(!gasto){
        return;
    }

    idEnEdicion = id;
    inputCantidad.value = gasto.cantidad;
    inputNombreGasto.value = gasto.nombre;
    selectFamilia.value = gasto.categoria;
    document.querySelector(`input[name="tipo"][value="${gasto.tipo}"]`).checked = true;
    inputFecha.value = gasto.fecha;

    form.querySelector(".btn-primario").textContent = "Guardar cambios";
    btnCancelarEdicion.hidden = false;
    form.scrollIntoView({ behavior: "smooth"});
}

function cancelarEdicion(){
    idEnEdicion = null;
    form.reset();
    form.querySelector(".btn-primario").textContent = "Añadir gasto";
    btnCancelarEdicion.hidden = true;
    mensajeError.textContent = "";

    inputFecha.value = obtenerFechaHoyISO();
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

function borrarGasto(id){
    gastos = gastos.filter((gasto)=> gasto.id !== id);
    guardarGastos();
    renderGastos();
    renderAnalisis();
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
        fecha.textContent = formatearFecha(gasto.fecha);

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


        const botones = document.createElement("div");
        botones.className = "gasto-acciones";

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "gasto-btn gasto-btn-editar";
        btnEditar.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        btnEditar.setAttribute("aria-label", "Editar gasto");
        btnEditar.title = "Editar";
        btnEditar.dataset.id = gasto.id;

        const btnBorrar = document.createElement("button");
        btnBorrar.type = "button";
        btnBorrar.className = "gasto-btn gasto-btn-borrar";
        btnBorrar.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        btnBorrar.setAttribute("aria-label", "Borrar gasto");
        btnBorrar.title = "Borrar";
        btnBorrar.dataset.id = gasto.id;


        botones.appendChild(btnEditar);
        botones.appendChild(btnBorrar);

        item.appendChild(info);
        item.appendChild(categoria);
        item.appendChild(cantidad);
        item.appendChild(botones);
        listaGastos.appendChild(item);
    }
}

listaGastos.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".gasto-btn");
    if(!boton){
        return;
    }

    const id = Number(boton.dataset.id);

    if(boton.classList.contains("gasto-btn-borrar")){
        borrarGasto(id);
    } else if(boton.classList.contains("gasto-btn-editar")) {
        prepararEdicion(id);
    }
});

btnCancelarEdicion.addEventListener("click", cancelarEdicion);


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


function calcularTotales(listaGastos){
    let totalGastos = 0;
    let totalIngresos = 0;

    for(const gasto of listaGastos){
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

function calcularGastosPorCategoria(listaGastos){
    const totalesPorCategoria = {};

    for(const gasto of listaGastos){
        if(gasto.tipo === "ingreso"){
            continue;
        }
        const acumulado = totalesPorCategoria[gasto.categoria] ?? 0;
        totalesPorCategoria[gasto.categoria] = acumulado + gasto.cantidad;
    }
    return totalesPorCategoria;
}



function calcularBalanceAcumulado(listaGastos){
    const ordenados = [...listaGastos].sort((a,b) => a.fecha.localeCompare(b.fecha));
    let acumulado = 0;
    const etiquetas = [];
    const valores = [];
    let ultimaFecha = null;

    for(const gasto of ordenados){
        acumulado += gasto.tipo === "ingreso" ? gasto.cantidad : -gasto.cantidad;

        if(gasto.fecha === ultimaFecha){
            valores[valores.length - 1] = acumulado;
        } else {
            
        
        etiquetas.push(formatearFecha(gasto.fecha));
        valores.push(acumulado);
        ultimaFecha = gasto.fecha;
        }
    }

    return { etiquetas, valores };
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


function obtenerGastosFiltrados(){
    const desde = inputFechaDesde.value;
    const hasta = inputFechaHasta.value;
    const texto = inputBuscadorAnalisis.value.trim().toLowerCase();

    return gastos.filter(function (gasto){
        if(desde && gasto.fecha < desde){
            return false;
        }
        if(hasta && gasto.fecha > hasta){
            return false;
        }
        if(texto !== ""){
            const coincideNombre = gasto.nombre.toLowerCase().includes(texto);
            const coincideFecha = formatearFecha(gasto.fecha).includes(texto);
            if(!coincideNombre && !coincideFecha){
                return false;
            }
        }
        return true;
    });
}

function renderAnalisis(){
    const gastosFiltrados = obtenerGastosFiltrados();
    const totales = calcularTotales(gastosFiltrados);

    document.getElementById("total-ingresos").textContent = `${totales.totalIngresos.toFixed(2)} €`;
    document.getElementById("total-gastos").textContent = `${totales.totalGastos.toFixed(2)} €`;
    const signoBalance = totales.balance >= 0 ? "+" : "-";
    document.getElementById("balance").textContent = `${signoBalance}${Math.abs(totales.balance).toFixed(2)}€`;

    const totalesPorCategoria = calcularGastosPorCategoria(gastosFiltrados);
    const contenedorCategorias = document.getElementById("detalle-categorias-lista");
    contenedorCategorias.innerHTML = "";

    for(const [categoria, total] of Object.entries(totalesPorCategoria)){
        const detalle = document.createElement("details");
        detalle.className = "categoria-acordeon";

        const resumen = document.createElement("summary");
        resumen.className = "categoria-acordeon-resumen";

        const nombreCategoria = document.createElement("span");
        nombreCategoria.className = "categoria-acordeon-nombre";
        nombreCategoria.textContent = categoria;

        const totalCategoria = document.createElement("span");
        totalCategoria.className = "categoria-acordeon-total";
        totalCategoria.textContent = `${total.toFixed(2)}€`;

        resumen.appendChild(nombreCategoria);
        resumen.appendChild(totalCategoria);
        detalle.appendChild(resumen);

        const listaGastosCategoria = document.createElement("ul");
        listaGastosCategoria.className = "categoria-acordeon-gastos";

        const gastosCategoria = gastosFiltrados.filter((gasto) => gasto.tipo === "gasto" && gasto.categoria === categoria);
        for(const gasto of gastosCategoria){
            const item = document.createElement("li");

            const descripcion = document.createElement("span");
            descripcion.textContent = `${formatearFecha(gasto.fecha)} — ${gasto.nombre}`;

            const cantidad = document.createElement("span");
            cantidad.className = "detalle-categoria-cantidad";
            cantidad.textContent = `${gasto.cantidad.toFixed(2)}€`;

            item.appendChild(descripcion);
            item.appendChild(cantidad);
            listaGastosCategoria.appendChild(item);
        }

        detalle.appendChild(listaGastosCategoria);
        contenedorCategorias.appendChild(detalle);
    }

    const maxCategoria = categoriaConMasGasto(totalesPorCategoria);
    const textoDestacado = document.getElementById("categoria-destacada");
    textoDestacado.textContent = maxCategoria ? `Mas gasto en: ${maxCategoria[0]} (${maxCategoria[1].toFixed(2)}€)` : "Todavia no hay gastos.";

    actualizarGraficos(gastosFiltrados);
}


const exportBtn = document.getElementById("exportar-btn");
exportBtn.addEventListener("click", descargarCSV);


function obtenerFechaHoyISO(){
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

function normalizarFecha(fecha){
    if(fecha.includes("-")){
        return fecha;
    }
    const partes = fecha.split("/");
    const dia = partes[0].padStart(2, "0");
    const mes = partes[1].padStart(2, "0");
    const año = partes[2];
    return `${año}-${mes}-${dia}`;
}

function formatearFecha(fechaISO){
    const [año, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${año}`;
}




form.addEventListener("submit", function (evento){
    evento.preventDefault();

    const textoCantidad = inputCantidad.value.trim().replace(",", ".");
    const cantidad = Number(textoCantidad);
    const nombre = inputNombreGasto.value.trim();
    const categoria = selectFamilia.value;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const fecha = inputFecha.value;

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
    if(fecha === ""){
        mensajeError.textContent = "Selecciona una fecha.";
        return;
    }


    mensajeError.textContent = "";

    if(idEnEdicion !== null){
        const gasto =  gastos.find((g) => g.id === idEnEdicion);
        gasto.nombre = nombre;
        gasto.cantidad = cantidad;
        gasto.categoria = categoria;
        gasto.tipo = tipo;
        gasto.fecha = fecha;

        idEnEdicion = null;
        form.querySelector(".btn-primario").textContent = "Añadir gasto";
        btnCancelarEdicion.hidden = true;
    } else {

        const nuevoGasto = {
            id: generarId(),
            nombre: nombre,
            cantidad:cantidad,
            categoria: categoria,
            fecha: fecha,
            tipo: tipo,
        };
        gastos.push(nuevoGasto);
    }

    guardarGastos();
    renderGastos();
    renderAnalisis();
    form.reset();

    inputFecha.value = obtenerFechaHoyISO();

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

inputFechaDesde.addEventListener("input", renderAnalisis);
inputFechaHasta.addEventListener("input", renderAnalisis);
inputBuscadorAnalisis.addEventListener("input", renderAnalisis);

btnLimpiarFiltros.addEventListener("click", function () {
    inputFechaDesde.value = "";
    inputFechaHasta.value = "";
    inputBuscadorAnalisis.value = "";
    renderAnalisis();
});

inputFecha.value = obtenerFechaHoyISO();

renderGastos();
renderCategorias();
renderAnalisis();

const botonesTab = document.querySelectorAll(".tab-btn");
const panelesTab = document.querySelectorAll(".tab-panel");
const botonesSubtab = document.querySelectorAll(".subtab-btn");
const panelesSubtab = document.querySelectorAll(".subtab-panel");

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

botonesSubtab.forEach(function(boton){
    boton.addEventListener("click", function () {
        const destino = boton.dataset.subtab;

        botonesSubtab.forEach(function (b) {
            b.classList.toggle("activo", b === boton);
        });

        panelesSubtab.forEach(function (panel) {
            panel.classList.toggle("activo", panel.id === destino);
        });
    });
});
