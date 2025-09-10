'use strict'

import { ctx, canvas } from "./cobeteGame.js"

// Crear una lista vacía para almacenar los rectángulos
export let rectangleList = [];

// Función para add un nuevo rectángulo a la lista
function addRectangle(x, y, width, height, color) {
    let rectangle = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    };

    // add el rectángulo a la lista
    rectangleList.push(rectangle);
}

// Ejemplo de uso: add varios rectángulos
export function addRectangles()
{
    //addRectangle(345, 150, 10, 450, 'lime');

    /* addRectangle(40, 450, 200, 10, 'orange');
    addRectangle(460, 450, 200, 10, 'orange');

    addRectangle(100, 200, 200, 10, 'orange');
    addRectangle(400, 200, 200, 10, 'orange'); */
   
    
    //addRectangle(50, 70, 120, 30, 'purple');
}

//for (let i = 0; i < listaDeRectangulos.length; i++)

// Mostrar los rectángulos en la consola
