'use strict'

export let rectangleList1 = [];

function addRectangle(x, y, width, height, color) {
    let rectangle = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    };
    rectangleList1.push(rectangle);
}

export function addRectangles1()
{
    addRectangle(345, 170, 10, 430, 'lime');

    addRectangle(100, 75, 190, 10, 'orange');
    addRectangle(410, 75, 190, 10, 'orange');
    
    addRectangle(25, 200, 200, 10, 'orange');
    addRectangle(475, 200, 200, 10, 'orange');
    
    addRectangle(175, 350, 10, 250, 'orange');
    addRectangle(525, 350, 10, 250, 'orange');
}
