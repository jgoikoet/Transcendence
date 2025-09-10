'use strict'

export let rectangleList3 = [];

function addRectangle(x, y, width, height, color) {
    let rectangle = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    };
    rectangleList3.push(rectangle);
}

export function addRectangles3()
{
    addRectangle(345, 280, 10, 320, 'lime');
    addRectangle(150, 85, 30, 30, 'purple');
    addRectangle(520, 85, 30, 30, 'purple');
    addRectangle(250, 85, 30, 30, 'purple');
    addRectangle(420, 85, 30, 30, 'purple');
    addRectangle(100, 300, 10, 300, 'lime');
    addRectangle(590, 300, 10, 300, 'lime');
    addRectangle(280, 210, 10, 100, 'lime');
    addRectangle(410, 210, 10, 100, 'lime');
    addRectangle(100, 200, 500, 10, 'orange');
    addRectangle(250, 510, 200, 10, 'orange');
}
