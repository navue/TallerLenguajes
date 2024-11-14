const { chromium } = require("playwright");
const exceljs = require("exceljs");

//Función genérica que extrae los datos y asigna los puntajes
async function extraerDatos(page, url, selector, elementoOffset = 0) {
  await page.goto(url);
  return await page.evaluate(
    ({ selector, elementoOffset }) => {
      return Array.from(document.querySelectorAll(selector))
        .slice(0, 5)
        .map((elemento, index) => [
          elemento.innerText.trim().substring(elementoOffset),
          5 - index,
        ]);
    },
    { selector, elementoOffset }
  );
}

//Funciones específicas para cada fuente que utilizan la función genérica
async function extraerTiobe(page) {
  return await extraerDatos(
    page,
    "https://www.tiobe.com/tiobe-index/",
    ".table.table-striped.table-top20 tbody tr td:nth-child(5)"
  );
}

async function extraerLinkedin(page) {
  return await extraerDatos(
    page,
    "https://www.linkedin.com/pulse/6-best-programming-languages-web-development-2024-soma-sharma-lmvkc",
    "div h3 span",
    3
  );
}

async function extraerTeclab(page) {
  return await extraerDatos(
    page,
    "https://teclab.edu.ar/tecnologia-y-desarrollo/lenguajes-de-programacion-mas-usados/",
    "ol.wp-block-list li a"
  );
}

//Función que actualiza el puntaje de cada lenguaje
function actualizarPuntaje(lenguajes, ranking) {
  ranking.forEach(([nombre, puntajeFuente]) => {
    if (lenguajes[nombre]) {
      lenguajes[nombre] += puntajeFuente;
    } else {
      lenguajes[nombre] = puntajeFuente;
    }
  });
  return lenguajes;
}

//Función que genera una escala de tonos de rojo para graficar los puntajes
function generarTonosRojos(cantidad) {
  const tonos = [];
  for (let i = 0; i < cantidad; i++) {
    const intensidad = Math.floor((i * 255) / (cantidad - 1));
    const hex = intensidad.toString(16).padStart(2, "0");
    tonos.push(`FF${hex}${hex}`);
  }
  return tonos;
}

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  const puntajeAcumulativo = {};

  //Se crea el archivo Excel con exceljs
  const libro = new exceljs.Workbook();
  const hoja = libro.addWorksheet("RankingsLenguajes");

  //Función para agregar secciones en el excel por cada fuente con el puntaje actualizado de los lenguajes
  function agregarSeccion(nombreSeccion, ranking, puntajeActualizado) {
    hoja.addRow([nombreSeccion]).font = { bold: true };
    hoja.addRow(["Lenguaje", "Puntaje"]);
    ranking.forEach(([nombre]) => {
      const puntaje = puntajeActualizado[nombre];
      hoja.addRow([nombre, puntaje]);
    });
    hoja.addRow([""]);
  }

  //Se extraen y actualizan los rankings de cada fuente
  const tiobe = await extraerTiobe(pagina);
  actualizarPuntaje(puntajeAcumulativo, tiobe);
  agregarSeccion("TIOBE", tiobe, { ...puntajeAcumulativo });

  const linkedin = await extraerLinkedin(pagina);
  actualizarPuntaje(puntajeAcumulativo, linkedin);
  agregarSeccion("LINKEDIN", linkedin, { ...puntajeAcumulativo });

  const teclab = await extraerTeclab(pagina);
  actualizarPuntaje(puntajeAcumulativo, teclab);
  agregarSeccion("TECLAB", teclab, { ...puntajeAcumulativo });

  //Se crea la sección de puntajes finales con un tono de la escala por cada lenguaje en celdas vacias
  hoja.addRow(["ANÁLISIS"]).font = { bold: true };
  hoja.addRow(["Lenguaje", "Puntaje"]);
  const nombresLenguajes = Object.keys(puntajeAcumulativo);
  const coloresRojos = generarTonosRojos(nombresLenguajes.length);
  Object.entries(puntajeAcumulativo)
    .sort(([, puntajeA], [, puntajeB]) => puntajeB - puntajeA)
    .forEach(([nombre, puntajeFinal], index) => {
      const fila = hoja.addRow([nombre, puntajeFinal]);
      const color = coloresRojos[index];
      for (let i = 0; i < puntajeFinal; i++) {
        const celda = fila.getCell(3 + i);
        celda.value = "";
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
        celda.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      }
    });

  //Se ajusta el ancho de las celdas al largo del nombre del lenguaje
  const columna = hoja.getColumn(1);
  let maxLongitud = 0;
  columna.eachCell({ includeEmpty: true }, (celda) => {
    const longitudCelda = celda.value ? celda.value.toString().length : 10;
    if (longitudCelda > maxLongitud) maxLongitud = celda.value.toString().length;
  });
  columna.width = maxLongitud + 2;

  //Se guarda el archivo
  await libro.xlsx.writeFile("RankingsLenguajes2024.xlsx");
  console.log("Archivo Excel creado: RankingsLenguajes2024.xlsx");

  await navegador.close();
})();