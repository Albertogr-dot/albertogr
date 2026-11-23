
// ======================================
// 1. SELECCIONAR ELEMENTOS DEL HTML
// ======================================

const botonNuevaVenta = document.getElementById("btn-nueva-venta");
const formularioVenta = document.getElementById("formulario-venta");
const botonGuardarVenta = document.getElementById("guardar-venta");
const botonCancelarVenta = document.getElementById("cancelar-venta");

const productoVenta = document.getElementById("producto-venta");
const cantidadVenta = document.getElementById("cantidad-venta");
const precioVenta = document.getElementById("precio-venta");
const fechaVenta = document.getElementById("fecha-venta");
const clienteVenta = document.getElementById("cliente-venta");

const listaVentas = document.getElementById("lista-ventas");
const buscadorVentas = document.getElementById("buscador-ventas");
const mensajeSinVentas = document.getElementById("mensaje-sin-ventas");

const totalVentas = document.getElementById("total-ventas");
const ingresosVentas = document.getElementById("ingresos-ventas");


// ======================================
// 2. RECUPERAR LOS DATOS GUARDADOS
// ======================================

let productos = [];
let ventas = [];

try {
  productos = JSON.parse(localStorage.getItem("productos")) || [];

  if (!Array.isArray(productos)) {
    productos = [];
  }

  ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  if (!Array.isArray(ventas)) {
    ventas = [];
  }

} catch (error) {
  console.error("Error al recuperar los datos:", error);
  alert("No se han podido recuperar los datos guardados.");
}


// ======================================
// 3. GUARDAR LOS DATOS EN EL NAVEGADOR
// ======================================

function guardarDatos() {

  const productosAnteriores = localStorage.getItem("productos");
  const ventasAnteriores = localStorage.getItem("ventas");

  try {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventas", JSON.stringify(ventas));

    return true;

  } catch (error) {

    console.error("Error al guardar los datos:", error);

    // Intentar recuperar los datos anteriores.
    try {
      if (productosAnteriores === null) {
        localStorage.removeItem("productos");
      } else {
        localStorage.setItem("productos", productosAnteriores);
      }

      if (ventasAnteriores === null) {
        localStorage.removeItem("ventas");
      } else {
        localStorage.setItem("ventas", ventasAnteriores);
      }

    } catch (errorRestauracion) {
      console.error("No se pudieron restaurar los datos:", errorRestauracion);
    }

    alert("No se han podido guardar los cambios.");

    return false;
  }
}


// ======================================
// 4. MOSTRAR LOS PRODUCTOS DISPONIBLES
// ======================================

function cargarProductos() {

  productoVenta.innerHTML = "";

  const opcionInicial = document.createElement("option");

  opcionInicial.value = "";
  opcionInicial.textContent = "Selecciona un producto";

  productoVenta.appendChild(opcionInicial);

  productos.forEach(function(producto, indice) {

    const opcion = document.createElement("option");

    opcion.value = indice;
    opcion.textContent =
      producto.nombre + " (Stock: " + producto.stock + ")";

    // No permitir vender productos sin existencias.
    opcion.disabled = Number(producto.stock) <= 0;

    productoVenta.appendChild(opcion);

  });

}


// ======================================
// 5. ACTUALIZAR EL PRECIO DEL PRODUCTO
// ======================================

productoVenta.addEventListener("change", function() {

  const indice = Number(productoVenta.value);

  if (productoVenta.value === "") {
    precioVenta.value = "";
    return;
  }

  const producto = productos[indice];

  if (producto) {
    precioVenta.value = Number(producto.precio).toFixed(2);
  }

});


// ======================================
// 6. ABRIR Y CERRAR EL FORMULARIO
// ======================================

function limpiarFormulario() {

  productoVenta.value = "";
  cantidadVenta.value = "";
  precioVenta.value = "";
  clienteVenta.value = "";

  fechaVenta.value = obtenerFechaActual();

}


function obtenerFechaActual() {

  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return anio + "-" + mes + "-" + dia;

}


function abrirFormularioVenta() {

  if (productos.length === 0) {
    alert("Primero debes añadir productos a tu inventario.");
    return;
  }

  limpiarFormulario();
  cargarProductos();

  formularioVenta.hidden = false;

  productoVenta.focus();

}


function cerrarFormularioVenta() {

  formularioVenta.hidden = true;

  limpiarFormulario();

}


botonNuevaVenta.addEventListener("click", abrirFormularioVenta);

botonCancelarVenta.addEventListener("click", cerrarFormularioVenta);


// ======================================
// 7. REGISTRAR UNA NUEVA VENTA
// ======================================

botonGuardarVenta.addEventListener("click", function() {

  // Obtener los valores del formulario.

  const indiceTexto = productoVenta.value;
  const cantidadTexto = cantidadVenta.value;
  const precioTexto = precioVenta.value;
  const fecha = fechaVenta.value;
  const cliente = clienteVenta.value.trim();

  const cantidad = Number(cantidadTexto);
  const precio = Number(precioTexto);
  const indice = Number(indiceTexto);


  // Comprobar que los campos obligatorios estén completos.

  if (
    indiceTexto === "" ||
    cantidadTexto === "" ||
    precioTexto === "" ||
    fecha === ""
  ) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }


  // Comprobar que los números sean válidos.

  if (
    !Number.isInteger(cantidad) ||
    !Number.isFinite(precio) ||
    cantidad <= 0 ||
    precio < 0
  ) {
    alert("Introduce una cantidad y un precio válidos.");
    return;
  }


  // Comprobar que el producto existe.

  const producto = productos[indice];

  if (!producto) {
    alert("No se ha encontrado el producto seleccionado.");
    return;
  }


  // Comprobar que hay suficiente stock.

  if (cantidad > Number(producto.stock)) {

    alert(
      "No hay suficiente stock. Unidades disponibles: " +
      producto.stock
    );

    return;
  }


  // Calcular el importe total.

  const importeTotal = Number((cantidad * precio).toFixed(2));


  // Crear el objeto de la venta.

  const nuevaVenta = {
    producto: producto.nombre,
    cantidad: cantidad,
    precio: precio,
    total: importeTotal,
    fecha: fecha,
    cliente: cliente
  };


  // Guardar copias por si falla el almacenamiento.

  const productosAnteriores = [...productos];
  const ventasAnteriores = [...ventas];


  // Descontar las unidades del inventario.

  producto.stock = Number(producto.stock) - cantidad;


  // Añadir la venta al historial.

  ventas.push(nuevaVenta);


  // Guardar los cambios.

  if (!guardarDatos()) {

    productos = productosAnteriores;
    ventas = ventasAnteriores;

    return;
  }


  // Actualizar la página.

  mostrarVentas(buscadorVentas.value);
  cargarProductos();

  cerrarFormularioVenta();

  alert("¡Venta registrada correctamente!");

});


// ======================================
// 8. MOSTRAR EL HISTORIAL DE VENTAS
// ======================================

function mostrarVentas(filtro = "") {

  listaVentas.innerHTML = "";

  const textoBusqueda = filtro.trim().toLowerCase();

  const ventasFiltradas = ventas.filter(function(venta) {

    return (
      venta.producto.toLowerCase().includes(textoBusqueda) ||
      venta.cliente.toLowerCase().includes(textoBusqueda) ||
      venta.fecha.includes(textoBusqueda)
    );

  });


  ventasFiltradas.forEach(function(venta) {

    const fila = document.createElement("tr");

    const celdaFecha = document.createElement("td");
    const celdaProducto = document.createElement("td");
    const celdaCantidad = document.createElement("td");
    const celdaPrecio = document.createElement("td");
    const celdaTotal = document.createElement("td");
    const celdaCliente = document.createElement("td");
    const celdaAcciones = document.createElement("td");


    celdaFecha.textContent = venta.fecha;
    celdaProducto.textContent = venta.producto;
    celdaCantidad.textContent = venta.cantidad;
    celdaPrecio.textContent =
      Number(venta.precio).toFixed(2) + " €";

    celdaTotal.textContent =
      Number(venta.total).toFixed(2) + " €";

    celdaCliente.textContent = venta.cliente || "Sin especificar";

    celdaAcciones.textContent = "—";


    fila.appendChild(celdaFecha);
    fila.appendChild(celdaProducto);
    fila.appendChild(celdaCantidad);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaTotal);
    fila.appendChild(celdaCliente);
    fila.appendChild(celdaAcciones);

    listaVentas.appendChild(fila);

  });


  // Mostrar u ocultar el mensaje de tabla vacía.

  if (ventasFiltradas.length === 0) {

    mensajeSinVentas.hidden = false;

    if (ventas.length === 0) {
      mensajeSinVentas.textContent =
        "Todavía no tienes ventas registradas.";
    } else {
      mensajeSinVentas.textContent =
        "No se han encontrado ventas.";
    }

  } else {

    mensajeSinVentas.hidden = true;

  }


  actualizarResumen();

}


// ======================================
// 9. ACTUALIZAR EL RESUMEN DE VENTAS
// ======================================

function actualizarResumen() {

  const cantidadTotal = ventas.length;

  const ingresos = ventas.reduce(function(acumulado, venta) {

    return acumulado + Number(venta.total);

  }, 0);


  totalVentas.textContent = cantidadTotal;

  ingresosVentas.textContent =
    ingresos.toFixed(2).replace(".", ",") + " €";

}


// ======================================
// 10. BUSCAR VENTAS
// ======================================

buscadorVentas.addEventListener("input", function() {

  mostrarVentas(buscadorVentas.value);

});


// ======================================
// 11. CARGAR LOS DATOS AL ABRIR LA PÁGINA
// ======================================

fechaVenta.value = obtenerFechaActual();

cargarProductos();

mostrarVentas();
