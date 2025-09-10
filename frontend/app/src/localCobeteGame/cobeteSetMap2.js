'use strict'

export let rectangleList2 = [];

function addRectangle(x, y, width, height, color) {
    let rectangle = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    };
    rectangleList2.push(rectangle);
}

export function addRectangles2()
{
    addRectangle(250, 200, 200, 30, 'purple');
    addRectangle(345, 150, 10, 450, 'lime');
    addRectangle(100, 70, 120, 30, 'yellow');
    addRectangle(480, 70, 120, 30, 'yellow');
    addRectangle(50, 200, 30, 30, 'purple');
    addRectangle(620, 200, 30, 30, 'purple');
    addRectangle(150, 200, 30, 30, 'purple');
    addRectangle(520, 200, 30, 30, 'purple');
    addRectangle(50, 300, 30, 30, 'purple');
    addRectangle(620, 300, 30, 30, 'purple');
    addRectangle(150, 300, 30, 30, 'purple');
    addRectangle(520, 300, 30, 30, 'purple');
    addRectangle(250, 300, 30, 30, 'purple');
    addRectangle(420, 300, 30, 30, 'purple');
    addRectangle(175, 400, 10, 200, 'orange');
    addRectangle(525, 400, 10, 200, 'orange');
}
