# Proyecto Web Scraping para Lenguajes de Programacion

## Objetivo

El objetivo de este proyecto es obtener información de la web utilizando la técnica de web scraping, recolectando dicha información de 3 fuentes diferentes y en áreas específicas:

* Tiobe - Herramienta para medir la popularidad u otros factores de los lenguajes de programación.
* Linkedin - Ranking centrado en los lenguajes de programación web más recomendados en el área laboral.
* TecLab - Ranking centrado en los lenguajes de programación web más recomendados en el área educativa.

Todos estos ranking tienen en común que se encuentran evaluados en el año 2024 y de los mismos se obtendrán los 5 primeros puestos. A estos lenguajes se les asignará un puntaje dependiendo de su posición en el ranking.

## Herramientas

Para llevar a cabo esta tarea se utilizará como stack de tecnología `playwright` de nodejs. Los datos obtenidos se analizarán y guardarán en un archivo Excel usando la biblioteca `exceljs`, que nos permite también modificar los estilos de las celdas para brindarle al análisis un enfóque gráfico.

## Funcionamiento

Los puntos más relavantes del funcionamiento del código son:

* Se extraen los datos para formar una tabla con el siguiente formato:

  | Fuente   |         |
  | Lenguaje | Puntaje |
  | Puesto1  |       5 |
  | Puesto2  |       4 |
  | Puesto3  |       3 |
  | Puesto4  |       2 |
  | Puesto5  |       1 |

* Los lenguajes estarán ordenados de arriba hacia abajo comenzando por el primer puesto. Cada puesto posee un puntaje, siendo 5 puntos el puntaje más alto y 1 punto el más bajo.
* Estos puntajes se irán actualizando a medida que se analiza una nueva fuente, por ejemplo, si Python tiene 5 puntos en el primer ranking y en el segundo obtiene 4, figurará en la tabla del segundo ranking con 9 puntos acumulativos.
* Una vez se obtengan los puntajes finales de TODOS los lenguajes analizados, se generará una nueva tabla, agregando tambien el armado de barras con distintos tonos de rojo. Estas barras estan formadas por X cantidad de celdas (donde X corresponde al puntaje final) y la intensidad de los tonos será mayor cuanto más puntaje tenga el lenguaje en cuestión.

## Análisis

La idea final del análisis es poder contrastar como los lenguajes de programación web son priorizados en el área laboral y el área educativa, teniendo también como tercer fuente de comparación el índice Tiobe. Una vez realizado este contraste, se puede obtener una idea aproximada de cual es el lenguaje más recomendado.