// ======================================
// 1. SELECCIONAR ELEMENTOS DEL HTML
// ======================================

const botonAnadir = document.getElementById("btn-anadir-producto");
const formularioProducto = document.getElementById("formulario-producto");

const botonGuardar = document.getElementById("guardar-producto");
const botonCancelar = document.getElementById("cancelar-producto");

const nombreProducto = document.getElementById("nombre-producto");
const precioProducto = document.getElementById("precio-producto");
const stockProducto = document.getElementById("stock-producto");

const listaProductos = document.getElementById("lista-productos");
const buscadorProductos = document.getElementById("buscador-productos");

const tituloFormulario = document.getElementById("titulo-formulario");
const mensajeSinProductos = document.getElementById("mensaje-sin-productos");


// ======================================
// 2. RECUPERAR PRODUCTOS GUARDADOS
// ======================================

let productos = [];

try {
  productos = JSON.parse(localStorage.getItem("productos")) || [];

  if (!Array.isArray(productos)) {
    productos = [];
  }

} catch (error) {
  console.error("No se pudieron recuperar los productos:", error);
  productos = [];
}

let indiceEdicion = null;


// ======================================
// 3. GUARDAR PRODUCTOS EN EL NAVEGADOR
// ======================================

function guardarEnNavegador() {

  try {
    localStorage.setItem("productos", JSON.stringify(productos));
    return true;

  } catch (error) {
    console.error("No se pudieron guardar los productos:", error);
    alert("No se han podido guardar los cambios en el navegador.");
    return false;
  }

}


// ======================================
// 4. MOSTRAR Y OCULTAR EL FORMULARIO
// ======================================

function abrirFormulario() {

  limpiarFormulario();

  indiceEdicion = null;

  tituloFormulario.textContent = "Nuevo producto";

  formularioProducto.hidden = false;

  nombreProducto.focus();

}


function cerrarFormulario() {

  formularioProducto.hidden = true;

  limpiarFormulario();

  indiceEdicion = null;

}


botonAnadir.addEventListener("click", abrirFormulario);

botonCancelar.addEventListener("click", cerrarFormulario);


// ======================================
// 5. LIMPIAR LOS CAMPOS
// ======================================

function limpiarFormulario() {

  nombreProducto.value = "";
  precioProducto.value = "";
  stockProducto.value = "";

}


// ======================================
// 6. CALCULAR EL ESTADO DEL STOCK
// ======================================

function obtenerEstado(stock) {

  if (stock < 2) {
    return "Stock bajo";

  } else if (stock <= 6) {
    return "Stock medio";

  } else {
    return "Stock alto";
  }

}


// ======================================
// 7. MOSTRAR LOS PRODUCTOS EN LA TABLA
// ======================================

function mostrarProductos(filtro = "") {

  listaProductos.innerHTML = "";

  const textoBusqueda = filtro.trim().toLowerCase();

  const productosFiltrados = productos
    .map(function (producto, indice) {
      return {
        producto: producto,
        indice: indice
      };
    })
    .filter(function (elemento) {

      return elemento.producto.nombre
        .toLowerCase()
        .includes(textoBusqueda);

    });


  productosFiltrados.forEach(function (elemento) {

    const producto = elemento.producto;
    const indiceReal = elemento.indice;

    const nuevaFila = document.createElement("tr");

    const celdaNombre = document.createElement("td");
    const celdaPrecio = document.createElement("td");
    const celdaStock = document.createElement("td");
    const celdaEstado = document.createElement("td");
    const celdaAcciones = document.createElement("td");


    // Nombre

    celdaNombre.textContent = producto.nombre;


    // Precio

    celdaPrecio.textContent =
      Number(producto.precio).toFixed(2) + " €";


    // Stock

    celdaStock.textContent = producto.stock + " unidades";


    // Estado

    const estado = obtenerEstado(Number(producto.stock));

    celdaEstado.textContent = estado;
    celdaEstado.classList.add("estado-stock");


    if (estado === "Stock bajo") {
      celdaEstado.classList.add("stock-bajo");

    } else if (estado === "Stock medio") {
      celdaEstado.classList.add("stock-medio");

    } else {
      celdaEstado.classList.add("stock-alto");
    }


    // Botón editar

    const botonEditar = document.createElement("button");

    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    botonEditar.classList.add("boton-editar");

    botonEditar.addEventListener("click", function () {
      editarProducto(indiceReal);
    });


    // Botón eliminar

    const botonEliminar = document.createElement("button");

    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("boton-eliminar");

    botonEliminar.addEventListener("click", function () {
      eliminarProducto(indiceReal);
    });


    // Añadir botones a la celda

    celdaAcciones.appendChild(botonEditar);
    celdaAcciones.appendChild(botonEliminar);


    // Añadir celdas a la fila

    nuevaFila.appendChild(celdaNombre);
    nuevaFila.appendChild(celdaPrecio);
    nuevaFila.appendChild(celdaStock);
    nuevaFila.appendChild(celdaEstado);
    nuevaFila.appendChild(celdaAcciones);


    // Añadir fila a la tabla

    listaProductos.appendChild(nuevaFila);

  });


  // Mostrar mensaje si no hay resultados

  if (productosFiltrados.length === 0) {

    mensajeSinProductos.hidden = false;

    if (productos.length === 0) {

      mensajeSinProductos.textContent =
        "Todavía no tienes productos registrados.";

    } else {

      mensajeSinProductos.textContent =
        "No se han encontrado productos.";

    }

  } else {

    mensajeSinProductos.hidden = true;

  }

}


// ======================================
// 8. AÑADIR O EDITAR UN PRODUCTO
// ======================================

botonGuardar.addEventListener("click", function () {

  const nombre = nombreProducto.value.trim();

  const precioTexto = precioProducto.value;
  const stockTexto = stockProducto.value;

  const precio = Number(precioTexto);
  const stock = Number(stockTexto);


  // Comprobar campos vacíos

  if (
    nombre === "" ||
    precioTexto === "" ||
    stockTexto === ""
  ) {

    alert("Por favor, completa todos los campos.");
    return;

  }


  // Comprobar valores numéricos

  if (
    !Number.isFinite(precio) ||
    !Number.isInteger(stock)
  ) {

    alert("Introduce un precio y un stock válidos.");
    return;

  }


  // Evitar números negativos

  if (precio < 0 || stock < 0) {

    alert("El precio y el stock no pueden ser negativos.");
    return;

  }


  // Crear el objeto del producto

  const producto = {
    nombre: nombre,
    precio: precio,
    stock: stock
  };


  // Guardar una copia para poder recuperar los datos
  // si falla el almacenamiento.

  const productosAnteriores = [...productos];


  // Comprobar si estamos añadiendo o editando

  if (indiceEdicion === null) {

    productos.push(producto);

  } else {

    productos[indiceEdicion] = producto;

  }


  // Guardar en el navegador

  if (!guardarEnNavegador()) {

    productos = productosAnteriores;
    return;

  }


  // Actualizar la tabla

  mostrarProductos(buscadorProductos.value);


  // Cerrar formulario

  cerrarFormulario();

});


// ======================================
// 9. EDITAR UN PRODUCTO
// ======================================

function editarProducto(indice) {

  const producto = productos[indice];

  if (!producto) {
    return;
  }

  nombreProducto.value = producto.nombre;
  precioProducto.value = producto.precio;
  stockProducto.value = producto.stock;

  tituloFormulario.textContent = "Editar producto";

  indiceEdicion = indice;

  formularioProducto.hidden = false;

  nombreProducto.focus();

}


// ======================================
// 10. ELIMINAR UN PRODUCTO
// ======================================

function eliminarProducto(indice) {

  const confirmar = confirm(
    "¿Seguro que quieres eliminar este producto?"
  );

  if (!confirmar) {
    return;
  }

  const productosAnteriores = [...productos];

  productos.splice(indice, 1);

  if (!guardarEnNavegador()) {

    productos = productosAnteriores;
    return;

  }

  mostrarProductos(buscadorProductos.value);

}


// ======================================
// 11. BUSCAR PRODUCTOS
// ======================================

buscadorProductos.addEventListener("input", function () {

  mostrarProductos(buscadorProductos.value);

});


// ======================================
// 12. CARGAR LOS PRODUCTOS AL ABRIR
// ======================================

mostrarProductos();
