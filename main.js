// main.js

document.addEventListener("DOMContentLoaded", function () {
    const dataUrl = "productos_ripley_paginas_1_a_5.json";
    let productos = [];
  
    // Cargar datos
    fetch(dataUrl)
      .then((res) => res.json())
      .then((data) => {
        productos = data;
        calcularKpis();
        generarGraficos();
        inicializarTabla();
      });
  
    // Calcular KPIs
    function calcularKpis() {
      const totalProductos = productos.length;
      const marcasUnicas = new Set(productos.map(p => p.Marca)).size;
      const descuentos = productos
        .map(p => parseInt(p.Descuento.replace(/[^0-9]/g, "")))
        .filter(d => !isNaN(d));
      const promedioDescuentos = descuentos.length > 0 ? (descuentos.reduce((a, b) => a + b, 0) / descuentos.length).toFixed(1) : 0;
      const preciosInternet = productos
        .map(p => parseFloat(p["Precio Internet Menor"].replace("S/ ", "").trim().replace(",", ".")))
        .filter(p => !isNaN(p));
      const precioPromedio = preciosInternet.length > 0 ? (preciosInternet.reduce((a, b) => a + b, 0) / preciosInternet.length).toFixed(2) : 0;
  
      document.getElementById("totalProductos").textContent = totalProductos;
      document.getElementById("totalMarcas").textContent = marcasUnicas;
      document.getElementById("promedioDescuentos").textContent = `${promedioDescuentos}%`;
      document.getElementById("precioPromedio").textContent = `S/ ${precioPromedio}`;
    }
  
    // Generar gráficos
    function generarGraficos() {
      const ctxTendencia = document.getElementById("chartTendencia").getContext("2d");
      const ctxMarcas = document.getElementById("chartMarcas").getContext("2d");
      const ctxColores = document.getElementById("chartColores").getContext("2d");
      const ctxEmblemas = document.getElementById("chartEmblemas").getContext("2d");
  
      // Tendencia de precios por marca
      const marcaPrecios = {};
      productos.forEach(p => {
        if (!marcaPrecios[p.Marca]) marcaPrecios[p.Marca] = [];
        const precio = parseFloat(p["Precio Internet Menor"].replace("S/ ", "").trim().replace(",", "."));
        if (!isNaN(precio)) marcaPrecios[p.Marca].push(precio);
      });
      const labelsTendencia = Object.keys(marcaPrecios);
      const dataTendencia = labelsTendencia.map(key =>
        marcaPrecios[key].length > 0
          ? marcaPrecios[key].reduce((a, b) => a + b, 0) / marcaPrecios[key].length
          : 0
      ).map(n => n.toFixed(2));
  
      new Chart(ctxTendencia, {
        type: "line",
        data: {
          labels: labelsTendencia,
          datasets: [{
            label: "Precio Promedio por Marca",
            data: dataTendencia,
            borderColor: "#4e73df",
            backgroundColor: "rgba(78, 115, 223, 0.2)",
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Precio Promedio (S/)" } },
          },
        },
      });
  
      // Modelos por marca
      const marcaConteo = {};
      productos.forEach(p => {
        if (!marcaConteo[p.Marca]) marcaConteo[p.Marca] = 0;
        marcaConteo[p.Marca]++;
      });
  
      new Chart(ctxMarcas, {
        type: "bar",
        data: {
          labels: Object.keys(marcaConteo),
          datasets: [{
            label: "Modelos por Marca",
            data: Object.values(marcaConteo),
            backgroundColor: "#1cc88a",
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Número de Modelos" } },
          },
        },
      });
  
      // Colores disponibles
      const colorConteo = {};
      productos.forEach(p => {
        p["Colores Disponibles"].forEach(color => {
          if (!colorConteo[color]) colorConteo[color] = 0;
          colorConteo[color]++;
        });
      });
  
      new Chart(ctxColores, {
        type: "pie",
        data: {
          labels: Object.keys(colorConteo),
          datasets: [{
            label: "Distribución de Colores",
            data: Object.values(colorConteo),
            backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"],
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "right" }, tooltip: { enabled: true } },
        },
      });
  
      // Emblemas por producto
      const emblemaConteo = {};
      productos.forEach(p => {
        p.Emblemas.forEach(emblema => {
          if (!emblemaConteo[emblema]) emblemaConteo[emblema] = 0;
          emblemaConteo[emblema]++;
        });
      });
  
      new Chart(ctxEmblemas, {
        type: "doughnut",
        data: {
          labels: Object.keys(emblemaConteo),
          datasets: [{
            label: "Emblemas por Producto",
            data: Object.values(emblemaConteo),
            backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"],
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "right" }, tooltip: { enabled: true } },
        },
      });
    }
  
    // Inicializar tabla con DataTables
    function inicializarTabla() {
      $("#tablaProductos").DataTable({
        data: productos,
        columns: [
          {
            data: "Nombre del Producto",
            render: function (data, type, row) {
              return `<a href="${row.Enlace}" target="_blank">${data}</a>`;
            },
          },
          { data: "Marca" },
          {
            data: "Precio Internet Menor",
            render: function (data) {
              return data === "N/A" ? "No disponible" : data;
            },
          },
          {
            data: "Descuento",
            render: function (data) {
              return data === "N/A" ? "No disponible" : data;
            },
          },
          {
            data: "Colores Disponibles",
            render: function (data) {
              return data.join(", ");
            },
          },
          {
            data: "Emblemas",
            render: function (data) {
              return data.length > 0 ? data.join(", ") : "Sin emblemas";
            },
          },
          {
            data: null,
            render: function (data, type, row) {
              return `<img src="${row.Imágenes[0]}" alt="Imagen del producto" style="width: 50px; height: auto;">`;
            },
          },
        ],
        dom:
          "<'row'<'col-sm-12 col-md-6'B><'col-sm-12 col-md-6'f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
          {
            extend: "excelHtml5",
            text: '<i class="fas fa-file-excel me-1"></i> Exportar a Excel',
            className: "btn btn-success",
            exportOptions: {
              columns: ":visible",
            },
          },
        ],
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json ",
        },
        paging: true,
        pageLength: 10,
        lengthChange: false,
        ordering: true,
        info: true,
        searching: true,
        scrollX: true,
        columnDefs: [
          { orderable: false, targets: -1 },
          { searchable: false, targets: -1 },
        ],
      });
    }
  
    // Toggle modo oscuro
    const toggleModeBtn = document.getElementById("toggleMode");
    toggleModeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      toggleModeBtn.innerHTML = document.body.classList.contains("dark-mode")
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    });
  });
  
  
  https://simple.ripley.com.pe/iphone-12-64gb-azul-reacondicionado-pmp20000007213?color_80=azul&s=mdco
  https://simple.ripley.com.pe%20/iphone-12-64gb-azul-reacondicionado-pmp20000007213
  https://simple.ripley.com.pe/iphone-12-128gb-blanco-reacondicionado-pmp20000007247
